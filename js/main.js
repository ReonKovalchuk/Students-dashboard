let DateTime = luxon.DateTime;
let Interval = luxon.Interval;
let studentID = 0;

let studentsArrayExample = new Array(
    {
        lastName: 'Иванов',
        firstName: 'Иван',
        middleName: 'Иванович',
        DoB: new Date('2000-01-01'),
        enrolledIn: 2019,
        department: 'Электротехнический',
        id: 1,
    },
    {
        lastName: 'Петров',
        firstName: 'Пётр',
        middleName: 'Петрович',
        DoB: new Date('2004-12-19'),
        enrolledIn: 2022,
        department: 'Информатики и телекоммуникации',
        id: 2,
    },
    {
        lastName: 'Сидорова',
        firstName: 'Коза',
        middleName: 'Михайловна',
        DoB: new Date('1992-04-10'),
        enrolledIn: 2010,
        department: 'Животноводческий',
        id: 3,
    }
);
if (localStorage.getItem('studentsDB') === null) {
    localStorage.setItem('studentsDB', JSON.stringify(studentsArrayExample))
}

// let studentsArrayOutput = JSON.parse(localStorage.getItem('studentsDB'));
// let currentDate = 
const DT_NOW = DateTime.now();
// const CURRENT_YEAR = DT_NOW;

function createTableRows() {
    //refresh studentsArrayOutput according to filters

    // let studentsArrayOutput = JSON.parse(localStorage.getItem('studentsDB'));

    let studentsArrayOutput = applyFilters()

    //create rows
    tbody = document.querySelector('.table-body');
    tbody.innerHTML = '';
    studentsArrayOutput.forEach(student => {
        tr = document.createElement('tr');

        tdName = document.createElement('td');
        tdDept = document.createElement('td');
        tdBD = document.createElement('td');
        tdStudiedIn = document.createElement('td');
        tdID = document.createElement('td');


        tr.setAttribute('tabindex', '0');

        //не делаем трим, тк считаем, что это сделано при вводе в бд
        tdName.innerHTML = `${student.lastName} ${student.firstName} ${student.middleName}`;
        tdDept.textContent = student.department;
        let renderedDoB = renderDoB(student.DoB);
        tdBD.textContent = renderedDoB.textContent;
        tdBD.setAttribute('sorttable_customkey', renderedDoB.customKey);
        tdStudiedIn.textContent = renderStudyYears(student.enrolledIn);
        tdID.textContent = student.id;

        tdID.classList.add('hidden', 'id')


        tr.append(tdName);
        tr.append(tdDept);
        tr.append(tdBD);
        tr.append(tdStudiedIn);
        tr.append(tdID);

        $(tr).blur(function () {
            this.classList.remove('table-active');
            // $('.table__change-record').prop("disabled", true);
            // $('.delete-record').prop("disabled", true);
        })
        $(tr).focus(function () {
            this.classList.add('table-active');
            // $('.table__change-record').prop("disabled", false);
            // $('.delete-record').prop("disabled", false);
            studentID = parseInt($('.table-active .id')[0].textContent);

        })

        tbody.append(tr);
    });
}

function renderDoB(DoB) {
    DoB = DateTime.fromISO(DoB)
    let renderedBD = DoB.toLocaleString('ru-RU')
    let i = Interval.fromDateTimes(DoB, DT_NOW)
    let age = Math.trunc(i.length('years'));
    let customKey = `${DoB.toISODate().replaceAll('-', '')}000000`
    return {
        textContent: `${renderedBD} (${age})`,
        customKey: customKey,
    };
}

function renderStudyYears(enrolledIn) {

    let graduatedIn = enrolledIn + 4;
    dateGraduatedIn = DateTime.local(graduatedIn, 9, 1);
    let years;
    if (dateGraduatedIn <= DT_NOW) {
        years = '(закончил_а)'
    } else {
        let dateEnrolledIn = DateTime.local(enrolledIn, 9, 1)
        if (dateEnrolledIn > DT_NOW && enrolledIn == DT_NOW.year) {
            years = '(абитуриент)'
        }
        else if (dateEnrolledIn > DT_NOW && enrolledIn > DT_NOW.year) {
            years = '';
        } else {
            let i = Interval.fromDateTimes(dateEnrolledIn, DT_NOW)
            years = Math.trunc(i.length('years')) + 1;
            years = `(${years} курс)`
        }

    }

    return `${enrolledIn}-${graduatedIn} ${years}`
}


function createNewStudent() {
    let newStudent = {};
    newStudent.lastName = $('#last-name-input').val().trim();
    newStudent.firstName = $('#first-name-input').val().trim();
    newStudent.middleName = $('#middle-name-input').val().trim();
    newStudent.DoB = DateTime.fromISO($('#DoB-input').val());
    newStudent.enrolledIn = parseInt($('#enrolledIn-input').val());
    newStudent.department = $('#department-input').val().trim();
    newStudent.id = DateTime.now().toString();

    let studentsDB = JSON.parse(localStorage.getItem('studentsDB'));
    studentsDB.push(newStudent);
    localStorage.removeItem('studentsDB');
    localStorage.setItem('studentsDB', JSON.stringify(studentsDB));

    let message = `Добавлена новая запись: \n ${newStudent.lastName} ${newStudent.firstName} ${newStudent.middleName}`;
    showToast(message, 'new');

    return newStudent;
}

function applyFilters() {
    let nameFilter = $('#name-filter').val().trim().toLowerCase();
    let deptFilter = $('#department-filter').val().trim().toLowerCase();
    let enrolledInFilter = parseInt($('#enrolledIn-filter').val());
    let graduatedInFilter = parseInt($('#graduatedIn-filter').val());

    let studentsDB = JSON.parse(localStorage.getItem('studentsDB'));

    if (nameFilter || deptFilter || enrolledInFilter || graduatedInFilter) {
        let studentsArrayOutput = studentsDB.filter(student => {
            // let pass = true;

            if (nameFilter) {
                const fullName = `${student.lastName} ${student.firstName} ${student.middleName}`;
                if (fullName.toLowerCase().indexOf(nameFilter) == -1) { return false }
            }

            if (deptFilter) {
                if (student.department.toLowerCase().indexOf(deptFilter) == -1) { return false }
            }

            if (enrolledInFilter) {
                if (student.enrolledIn !== enrolledInFilter) { return false }
            }

            if (graduatedInFilter) {
                if ((student.enrolledIn + 4) !== graduatedInFilter) { return false }
            }

            return true;
        });
        return studentsArrayOutput;

    } else {
        return studentsDB;
    }



}

function clearFormInputs(formClass) {
    $(`${formClass} input`).each(function (index, element) {
        element.value = '';
    });
    if (formClass === '.add-student') {
        $('.add-student-btn').removeClass('hidden');
        $('.add__change-record').addClass('hidden');
        studentID = 0;
    }
}

function setupRecordChange() {

    if (studentID === 0) return;

    $('.add-student-btn').addClass('hidden');
    $('.add__change-record').removeClass('hidden');

    let studentsDB = JSON.parse(localStorage.getItem('studentsDB'));
    // studentID = $('.table-active .id').textContent;
    //find active
    let student = studentsDB.find(student => student.id === studentID);
    let DoB = DateTime.fromISO(student.DoB)

    $('#last-name-input').val(student.lastName);
    $('#first-name-input').val(student.firstName);
    $('#middle-name-input').val(student.middleName);
    $('#DoB-input').val(`${DoB.toISODate()}`);
    $('#department-input').val(student.department);
    $('#enrolledIn-input').val(student.enrolledIn);
    $('#last-name-input').focus();

}

function changeRecord() {
    let studentsDB = JSON.parse(localStorage.getItem('studentsDB'));

    let index = studentsDB.findIndex(student => student.id === studentID);
    //change
    studentsDB[index].lastName = $('#last-name-input').val();
    studentsDB[index].firstName = $('#first-name-input').val();
    studentsDB[index].middleName = $('#middle-name-input').val();
    studentsDB[index].DoB = DateTime.fromISO($('#DoB-input').val());
    studentsDB[index].department = $('#department-input').val();
    studentsDB[index].enrolledIn = parseInt($('#enrolledIn-input').val());

    //rewrite db
    localStorage.removeItem('studentsDB');
    localStorage.setItem('studentsDB', JSON.stringify(studentsDB));
    $('.add-student-btn').removeClass('hidden');
    $('.add__change-record').addClass('hidden');

    message = `Запись изменена: \n ${studentsDB[index].lastName} ${studentsDB[index].firstName} ${studentsDB[index].middleName}`
    showToast(message, 'change');

    clearFormInputs('.add-student');
    createTableRows();
}



// function renderTRIntoObject(tr) {
//     // student = {}
//     // tr[0].textContent.split
// }

function deleteRecord() {
    if (studentID === 0) return;

    //get db
    let studentsDB = JSON.parse(localStorage.getItem('studentsDB'));

    //find active
    let index = studentsDB.findIndex(student => student.id === studentID);
    //remove
    studentsDB.splice(index, 1);

    //rewrite db
    localStorage.removeItem('studentsDB');
    localStorage.setItem('studentsDB', JSON.stringify(studentsDB));

    studentID = 0;

    showToast('Запись удалена', 'delete')
    createTableRows();
}

function showToast(message, type) {
    let color = '';
    switch (type) {
        case 'new':
            color = '#0d6efd';
            break;
        case 'change':
            color = '#198754';
            break;
        case 'delete':
            color = '#dc3545';
            break;
        default:
            color = '#0d6efd';
            break;

    }

    Toastify({
        text: message,
        duration: 5000,
        destination: "https://github.com/apvarun/toastify-js",
        newWindow: true,
        close: true,
        gravity: "bottom", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: color,
        },
        offset: {
            x: 10, // horizontal axis - can be a number or a string indicating unity. eg: '2em'
            y: 10 // vertical axis - can be a number or a string indicating unity. eg: '2em'
        },
        onClick: function () { } // Callback after click
    }).showToast();
}

document.addEventListener('DOMContentLoaded', () => {

    $('.clear-filters').click(function () {
        clearFormInputs('.filters');
        createTableRows();
    });
    // clearFormInputs('.filters');

    $('.clear-new-student-inputs').click(function () {
        clearFormInputs('.add-student');
    });

    $('.filters').submit(event => {
        event.preventDefault();
        createTableRows();

    });

    $('.table__change-record').click(setupRecordChange);
    $('.delete-record').click(deleteRecord);

    $('.add__change-record').click(changeRecord);

    createTableRows();

    (() => {
        'use strict'

        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        // const forms = document.querySelectorAll('.needs-validation')

        // Loop over them and prevent submission
        Array.from($('.needs-validation')).forEach(form => {
            form.addEventListener('submit', event => {
                if (!form.checkValidity()) {
                    event.preventDefault();

                    event.stopPropagation()
                } else {

                    createNewStudent();

                    //refresh table
                    createTableRows();



                }


                form.classList.add('was-validated');
            }, false)
        })
    })()

    $('body').on('input', '.input-number', function () {
        this.value = this.value.replace(/[^\d.]/g, '');

    });

    $('body').on('input', '.input-ru', function () {
        this.value = this.value.replace(/[^а-яё\s]/gi, '');
    });
});


let DateTime = luxon.DateTime;
let Interval = luxon.Interval;

let studentsArrayExample = new Array(
    {
        lastName: 'Иванов',
        firstName: 'Иван',
        middleName: 'Иванович',
        DoB: new Date('2000-01-01'),
        enrolledIn: 2019,
        department: 'Электротехнический'
    },
    {
        lastName: 'Петров',
        firstName: 'Пётр',
        middleName: 'Петрович',
        DoB: new Date('2004-12-19'),
        enrolledIn: 2022,
        department: 'Информатики и телекоммуникации'
    },
    {
        lastName: 'Сидорова',
        firstName: 'Коза',
        middleName: 'Михайловна',
        DoB: new Date('1992-04-10'),
        enrolledIn: 2010,
        department: 'Животноводческий'
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
        tdObject = document.createElement('td');


        tr.setAttribute('tabindex', '0');

        //не делаем трим, тк считаем, что это сделано при вводе в бд
        tdName.innerHTML = `${student.lastName} ${student.firstName} ${student.middleName}`;
        tdDept.textContent = student.department;
        let renderedDoB = renderDoB(student.DoB);
        tdBD.textContent = renderedDoB.textContent;
        tdBD.setAttribute('sorttable_customkey', renderedDoB.customKey);
        tdStudiedIn.textContent = renderStudyYears(student.enrolledIn);
        tdObject.value = student;


        tr.append(tdName);
        tr.append(tdDept);
        tr.append(tdBD);
        tr.append(tdStudiedIn);

        $(tr).blur(function () {
            this.classList.remove('table-active');
            $('.change-record').prop("disabled", true);
            $('.delete-record').prop("disabled", true);
        })
        $(tr).focus(function () {
            this.classList.add('table-active');
            $('.change-record').prop("disabled", false);
            $('.delete-record').prop("disabled", false);
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
    newStudent.DoB = $('#DoB-input').val();
    newStudent.enrolledIn = parseInt($('#enrolledIn-input').val());
    newStudent.department = $('#department-input').val().trim();

    let studentsDB = JSON.parse(localStorage.getItem('studentsDB'));
    studentsDB.push(newStudent);
    localStorage.removeItem('studentsDB');
    localStorage.setItem('studentsDB', JSON.stringify(studentsDB));

    Toastify({
        text: `Добавлена новая запись: \n ${newStudent.lastName} ${newStudent.firstName} ${newStudent.middleName}`,
        duration: 5000,
        destination: "https://github.com/apvarun/toastify-js",
        newWindow: true,
        close: true,
        gravity: "bottom", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "rgb(135, 183, 255)",
        },
        offset: {
            x: 10, // horizontal axis - can be a number or a string indicating unity. eg: '2em'
            y: 10 // vertical axis - can be a number or a string indicating unity. eg: '2em'
        },
        onClick: function () { } // Callback after click
    }).showToast();

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

}

// function changeRecord() {

// }

// function renderTRIntoObject(tr) {
//     // student = {}
//     // tr[0].textContent.split
// }

// function deleteRecord() {

//     //get db
//     let studentsDB = JSON.parse(localStorage.getItem('studentsDB'));
//     let activeRow = $('.table-active');
//     //find active

//     //remove

//     //rewrite db
// }

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


                    //show toast


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


let myLeads = []
let oldLeads = []
const inputEl = document.getElementById("input-el")
const inputBtn = document.getElementById("input-btn")
const tabBtn = document.getElementById("tab-btn")
const selectAllBtn = document.getElementById("sel-all-btn")
const deselectAllBtn = document.getElementById("deselect-btn")
const selectInverseBtn = document.getElementById("inverse-sel-btn")
const deleteSelectionBtn = document.getElementById("delete-sel-btn")
const copySelectionBtn = document.getElementById("copy-sel-btn")
const sendSelectionBtn = document.getElementById("send-btn")
const leadP = document.getElementById("list-of-leads")
const leadsFromLocal = JSON.parse(localStorage.getItem('myLeads'))
const contactsEL = document.getElementById('contacts')
const footerEL = document.getElementById('footer')
let year = new Date().getFullYear()
const originalRowColour = 'white'

if (leadsFromLocal) {
    myLeads = leadsFromLocal
    render(myLeads)
}
contactsEL.innerHTML = `<p>©RavelTech ${year}</p>`

tabBtn.addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        let url = tabs[0].url
        let row = findRow(url)
        if (alreadyExistsCheck(url)) {
            myLeads.push(url)
            localStorage.setItem("myLeads", JSON.stringify(myLeads))
            render(myLeads)
        } else {
            highlightRow(row)
        }

    })

})

function render(renderList) {
    let leadList = `<tr><th style="width:90%"></th><th></th></tr>`
    for (let i = 0; i < renderList.length; i++) {
        leadList += `
        <tr data-row-id="${renderList[i]}">
        <td class="url-row">
        <div>
        <a href="${renderList[i]}" target="_blank">
        ${renderList[i]}
        </a>
        </div>
        </td>
        <td class="checkbox" ><input type="checkbox" name="rowCheckbox" data-row-url="${renderList[i]}" ></td>
        </tr>
        `
    }
    leadP.innerHTML = leadList
}

inputBtn.addEventListener("click", function () {
    let elem = inputEl.value
    let row = findRow(elem)
    if (alreadyExistsCheck(elem) && elem.length > 0) {
        myLeads.push(elem)
        inputEl.value = ""
        localStorage.setItem("myLeads", JSON.stringify(myLeads))
        render(myLeads)
    } else {
        inputEl.value = ""
        highlightRow(row)
    }
})

function alreadyExistsCheck(value) {
    let row = findRow(value)
    if (row) {
        row.scrollIntoView()
        return confirm("Already Exists. Proceed Anyway?")
    } else {
        return true
    }
}

function findRow(url) {
    return document.querySelector(`[data-row-id="${url}"`)
}

function highlightRow(row) {
    row.scrollIntoView()
    row.style.background = 'yellow'
    setTimeout(function () {
        row.style.background = originalRowColour
    }, 500)
}

deleteSelectionBtn.addEventListener('dblclick', function () {
    if (confirm("Delete selected links?")) {
        let i, input, allCheckboxes, urlToDelete, indexOfUrl
        myLeads = JSON.parse(localStorage.getItem('myLeads'))
        allCheckboxes = document.getElementsByName("rowCheckbox")
        for (i = 0; i < allCheckboxes.length; i++) {
            input = allCheckboxes[i]
            if (input.checked) {
                urlToDelete = input.dataset.rowUrl
                indexOfUrl = myLeads.indexOf(urlToDelete)
                myLeads.splice(indexOfUrl, 1)
            }
        }
        localStorage.clear()
        localStorage.setItem("myLeads", JSON.stringify(myLeads))
        render(myLeads)
    }
})

selectAllBtn.addEventListener('click', function () {
    selection('select')
})
deselectAllBtn.addEventListener('click', function () {
    selection('deselect')
})
selectInverseBtn.addEventListener('click', function () {
    selection('invertSelection')
})

function selection(filter) {
    let allChecked, mode, i
    allChecked = document.getElementsByName("rowCheckbox")
    if (filter === 'select') {
        mode = true
        selectAll(mode)
    } else if (filter === 'deselect') {
        mode = false
        selectAll(mode)
    } else if (filter === 'invertSelection') {
        invertSelection()
    }

    function selectAll(modeStatus) {
        for (i = 0; i < allChecked.length; i++) {
            allChecked[i].checked = modeStatus
        }
    }

    function invertSelection() {
        for (i = 0; i < allChecked.length; i++) {
            allChecked[i].checked = !allChecked[i].checked;
        }
    }


}
copySelectionBtn.addEventListener("click", () => {
    let listOfUrls = checkLinks()
    let text = ''
    for(let i=0;i<listOfUrls.length;i++){
        text += `-  ${listOfUrls[i]}\n`
    }
    navigator.clipboard.writeText(text).then(() => {
        alert("Links successfully copied to clipboard");
    }).catch(() => {
        alert("something went wrong");
    });
})


sendSelectionBtn.addEventListener("click", function () {
    let input, listOfUrls, formattedMessage, recepient_email_address, subject
    listOfUrls = checkLinks()
    formattedMessage = createEmailBody(listOfUrls)

    if (listOfUrls.length > 0) {
        if (listOfUrls.length >= 3) alert('Can only send two links at a time')
        else {
            let subject = `Links from Leads_saver`
            recepient_email_address = prompt("Please enter recepient email Address")
            if (validateEmail(recepient_email_address)) {
                let link = `mailto:${recepient_email_address}?&subject=${subject}&body=${formattedMessage}`
                document.getElementById("send-link-anchor").href = link
            } else {
                alert('Invalid Email Address')
            }
        }
    } else {
        alert("No links selected")
    }

})

function checkLinks() {
    let i, list, allCheckboxes
    list = []
    allCheckboxes = document.getElementsByName("rowCheckbox")
    for (i = 0; i < allCheckboxes.length; i++) {
        input = allCheckboxes[i]
        if (input.checked) {
            list.push(input.dataset.rowUrl)
        }
    }
    return list
}

function createEmailBody(urls) {
    let message = "Here are your links:%0A"
    for (let i = 0; i < urls.length; i++) {
        message += `%0A    -${urls[i]}`
    }
    let closingTag = `%0A%0AWelcome%2C%0A%0ARavelTech.`
    message += closingTag
    console.log(message)
    return message
}

function validateEmail(emailAddress) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailAddress)) {
        return true
    } else {
        alert("Invalid email address!")
    }
}

// sendSelectionBtn.addEventListener("click", function () {
//     let input, listOfUrls, userEmailAddress, formattedMessage
//     listOfUrls = checkLinks()

//     if (listOfUrls.length > 0) {
//         let userPassword = "*********"
//         formattedMessage = createEmailBody(listOfUrls)
//         userEmailAddress = prompt("Please enter email Address", "johndoe@email.com")
//         if (validateEmail(userEmailAddress)) {
//             sendEmail(sender_email_address = userEmailAddress, password = userPassword, recepient_email_address = userEmailAddress, message = formattedMessage)
//         } else {
//             alert('invalid Email Address')
//         }
//     } else {
//         alert("No links selected")
//     }

// })

// function sendEmail(sender_email_address, password, recepient_email_address, message) {
//     Email.send({
//         Host: "smtp.gmail.com",
//         Username: `${sender_email_address}`,
//         Password: `${password}`,
//         To: `${recepient_email_address}`,
//         From: `${sender_email_address}`,
//         Subject: "Links from RavelTech",
//         Body: `${message}`,
//     }).then(
//         message => alert("mail sent successfully")
//     )
// }




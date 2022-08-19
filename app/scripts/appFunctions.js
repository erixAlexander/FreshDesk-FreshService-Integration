//--------------------------------FUNCTIONS DECLARATIONS-------------------------------------//

//--------------------------------GET CLIENT AND TICKET INFORMATION-------------------------------------//

const getTicketDetails = async function () {
  const getCurrentTicket = await client.data.get("ticket");
  const getCurrentContact = await client.data.get("contact");
  console.log(client.data);

  const currentTicket = {
    subject: getCurrentTicket.ticket.subject,
    ticketId: getCurrentTicket.ticket.id,
    name: getCurrentContact.contact.name,
    email: getCurrentContact.contact.email,
  };
  return currentTicket;
};

//--------------------------------API CALL "GET"-------------------------------------//

const freshGetApi = async function (url, auth, id = "") {
  const apiCall = await client.request.get(url + id, {
    headers: {
      "Content-Type": "application/json",
      Authorization: auth, //"Basic <%= encode(iparam.apiKeyFs) %>",
    },
  });
  const responseJson = JSON.parse(apiCall.response);
  return responseJson;
};

//--------------------------------CREATE DROPDOWN-------------------------------------//

const createDropDown = function (dataList, dropDown, catDiv, optionDiv) {
  if (dropDownModule.value === "request") {
    dropDown.innerHTML = "";
    dataList.forEach((i) => {
      if (dropDown.innerHTML == false) {
        const selectAnOption = document.createElement("option");
        selectAnOption.textContent = `Select an option`;
        dropDown.append(selectAnOption);
      }
      const option = document.createElement("option");
      option.textContent = `${i.name}`;
      option.id = `${i.id}`;
      option.setAttribute("data-displayId", `${i.display_id}`);
      dropDown.append(option);
    });

    catDiv.classList.remove("el-none");
    if (dropDownItems.innerHTML.trim()) {
      optionDiv.classList.remove("el-none");
      ticketCreateButton.classList.remove("el-none");
    }
  } else if (dropDownModule.value !== "request") {
    dropDownItems.innerHTML = "";
    ticketCreatedPara.innerHTML = "";
    divCustomFields.innerHTML = "";
    catDiv.classList.add("el-none");
    optionDiv.classList.add("el-none");
  }
};

//--------------------------------CREATE DROPDOWN FOR CUSTOM FIELDS-------------------------------------//

function makeDropDown(selectName, objName, optionsData, div) {
  div.innerHTML += `<label for="fname">${selectName}:</label>
              <select id="${selectName}" name="${objName}"></select>`;

  const select = document.getElementById(`${selectName}`);

  optionsData.forEach((choice, index) => {
    select.innerHTML += `<option id="${choice[0]}" name="${choice[0]}" data-index=${index}>${choice[0]}</option>`;
  });
  return select;
}

//--------------------------------CREATE FIELDS FOR CUSTOM SECTIONS-------------------------------------//

function makeNestedSections(sectionFields, sectionDiv) {
  sectionFields.forEach((field) => {
    switch (field.field_type) {
      case "custom_text":
        sectionDiv.innerHTML += `<label for="fname">${field.name} ${
          field.required ? '<span style="color:red">*</span>' : ""
        }:</label>
        <input class ="field" type="text" id="${field.name}" name="${
          field.name
        }">`;
        break;

      case "custom_paragraph":
        sectionDiv.innerHTML += `<label for="fname">${field.name} ${
          field.required ? '<span style="color:red">*</span>' : ""
        }:</label>
        <textarea rows="4" cols="50" type="text" id="${field.name}" name="${
          field.name
        }"></textarea>`;
        break;

      case "custom_checkbox":
        sectionDiv.innerHTML += `<label for="fname">${field.name} ${
          field.required ? '<span style="color:red">*</span>' : ""
        }:</label>
        <input class ="field" type="checkbox" id="${field.name}" name="${
          field.name
        }">`;
        break;

      case "custom_number":
        sectionDiv.innerHTML += `<label for="fname">${field.name} ${
          field.required ? '<span style="color:red">*</span>' : ""
        }:</label>
        <input class ="field" type="number" id="${field.name}" name="${
          field.name
        }">`;
        break;

      case "custom_dropdown":
        sectionDiv.innerHTML += `<label for="fname">${field.name} ${
          field.required ? '<span style="color:red">*</span>' : ""
        }:</label>
        <select id="${field.name}" name="${field.name}"></select>`;
        const customFieldSelect = document.getElementById(`${field.name}`);
        field.choices.forEach((choice) => {
          customFieldSelect.innerHTML += `<option id="${choice[0]}" name="${choice[0]}">${choice[0]}</option>`;
        });
        break;

      case "custom_multi_select_dropdown":
        sectionDiv.innerHTML += `<label for="fname">${field.name} ${
          field.required ? '<span style="color:red">*</span>' : ""
        }:</label>
        <select multiple="multiple" data-type="custom_multi_select_dropdown" id="${
          field.name
        }" name="${field.name}"></select>`;
        const customMultipleFieldSelect = document.getElementById(
          `${field.name}`
        );
        field.choices.forEach((choice) => {
          customMultipleFieldSelect.innerHTML += `<option id="${choice[0]}" name="${choice[0]}">${choice[0]}</option>`;
        });
        break;

      case "custom_date":
        sectionDiv.innerHTML += `<label for="fname">${field.name} ${
          field.required ? '<span style="color:red">*</span>' : ""
        }:</label>
        <input class ="field" type="date" id="${field.name}" name="${
          field.name
        }">`;
        break;

      //-------------------------------------------NESTED FIELD--------------------------------------------------//

      case "nested_field":
        nestedFieldName.push(`${field.name}`);
        nestedChoices = field.nested_field_choices;
        nestedChoicesArray.push(nestedChoices);

        const customNestedFieldSelect = makeDropDown(
          field.name,
          field.name,
          nestedChoices,
          sectionDiv
        );

        const selectedNestedCat =
          customNestedFieldSelect.options[customNestedFieldSelect.selectedIndex]
            .innerHTML;

        const nestedSecondChoices = nestedChoices.filter(
          (choice) => choice[0] == selectedNestedCat
        );

        const nestedSecondChoicesArray = nestedSecondChoices[0][2];

        const customSecondNestedFieldSelect = makeDropDown(
          `${field.name}-second`,
          field.nested_fields[0].name,
          nestedSecondChoicesArray,
          sectionDiv
        );

        const selectedNestedItem =
          customSecondNestedFieldSelect.options[
            customSecondNestedFieldSelect.selectedIndex
          ].innerHTML;

        const nestedItem = nestedSecondChoicesArray.filter(
          (choice) => choice[0] == selectedNestedItem
        );

        const nestedItemChoicesArray = nestedItem[0][2];

        makeDropDown(
          `${field.name}-item`,
          field.nested_fields[1].name,
          nestedItemChoicesArray,
          sectionDiv
        );
        break;
      //-------------------------------------------END NESTED FIELD--------------------------------------------------//

      case "custom_url":
        sectionDiv.innerHTML += `<label for="fname">${field.name}:</label>
        <input class ="field" type="url" id="${field.name}" name="${field.name}">`;
        break;

      case "custom_decimal":
        sectionDiv.innerHTML += `<label for="fname">${field.name}:</label>
        <input class ="field" type="number" id="${field.name}" name="${field.name}">`;
        break;

      case "custom_static_rich_text":
        sectionDiv.innerHTML += ``;
        break;

      case "custom_lookup_bigint":
        sectionDiv.innerHTML += `<label for="fname">${field.name} ${
          field.required ? '<span style="color:red">*</span>' : ""
        }:</label>
        <input class ="field" type="number" id="${field.name}" name="${
          field.name
        }">`;
        break;

      default:
        sectionDiv.innerHTML += `<label for="fname">No hay campos personalizados</label>`;
    }
  });
}

function makeTIcketObject(cf, customFieldsObject) {
  if (cf.name != undefined && cf.value) {
    if (cf.type == "checkbox") {
      customFieldsObject[`${cf.name}`] = cf.checked;
    } else if (cf.getAttribute("data-type") == "custom_multi_select_dropdown") {
      const multipleSelection = Array.from(
        document.getElementById(`${cf.id}`).selectedOptions
      ).map((v) => v.value);
      customFieldsObject[`${cf.name}`] = multipleSelection;
    } else if (cf.type == "number") {
      customFieldsObject[`${cf.name}`] = parseInt(cf.value);
    } else {
      customFieldsObject[`${cf.name}`] = cf.value;
    }
  }
}

async function getIparamsInfo() {
  const fsDomainIparams = await client.iparams.get().then((logData) => {
    return logData.$domainNameFs.url;
  });
  return fsDomainIparams;
}

const eventCallback = function (event) {
  console.log(event.type , " event occurred");
};
const testAgain = async () => {
  await client.events.on("ticket.replyClick", eventCallback);
}



const dropDownModule = document.querySelector(".module-select");
const categoriesDiv = document.querySelector(".select-cat-div");
const dropDownCategory = document.querySelector(".categories-select");
const itemsDiv = document.querySelector(".select-item-div");
const dropDownItems = document.querySelector(".items-select");
const ticketCreatedPara = document.querySelector(".ticket-created-div");
const divCustomFields = document.querySelector(".custom-fields-div");
const ticketCreateButton = document.getElementById("create-ticket-button");
const resetFormButton = document.getElementById("reset-form");
const divAdditionalItems = document.querySelector(".additional-items-div");
const mainForm = document.querySelector(".myform");
const freshBasicAuth = "Basic <%= encode(iparam.apiKeyFs) %>";

//-------------------------------------------CUSTOM FIELD VARIABLES--------------------------------------------------//
let sectionFields = [];
let fieldSectionDiv = "";
let customFields = [];
let nestedFieldName = [];
let nestedChoices = [];
let nestedChoicesArray = [];
let dropDownFieldSections = [];
const fieldSections = [];
let nestedSecondChoicesArray = [];
let additionalItems = ""

//-------------------------------------------CUSTOM FIELD VARIABLES--------------------------------------------------//

//------------------------------------------EVENT LISTENERS --------------------------------------------------------//

//--------------------------------MODULE DROPDOWN -------------------------------------//
dropDownModule.addEventListener("change", async function (e) {
  e.preventDefault();
  e.stopPropagation();
  testAgain()
  try {
    const fsUrlIparams = await getIparamsInfo();
    const fsCategoriesURL = fsUrlIparams + "/api/v2/service_catalog/categories";
    const serviceCategories = await freshGetApi(
      fsCategoriesURL,
      freshBasicAuth
    );
    const dataList = serviceCategories[`service_categories`];
    createDropDown(dataList, dropDownCategory, categoriesDiv, itemsDiv);
    ticketCreatedPara.innerHTML = "";
  } catch (error) {
    console.log(error);
  }
});

//--------------------------------CATEGORY DROPDOWN -------------------------------------//
dropDownCategory.addEventListener("change", async function (e) {
  e.preventDefault();
  e.stopPropagation();

  try {
    const fsUrlIparams = await getIparamsInfo();
    const fsItemsURL =
      fsUrlIparams + "/api/v2/service_catalog/items?category_id=";

    ticketCreatedPara.innerHTML = "";
    divCustomFields.innerHTML = "";

    const catValue = dropDownCategory.value;
    // This is another way to get the value dropDownCategory.options[dropDownCategory.selectedIndex].innerText
    if (catValue !== `Select an option`) {
      const catId = dropDownCategory.options[dropDownCategory.selectedIndex].id;
      const serviceItems = await freshGetApi(fsItemsURL, freshBasicAuth, catId);
      const dataList = serviceItems[`service_items`];
      createDropDown(dataList, dropDownItems, categoriesDiv, itemsDiv);
      itemsDiv.classList.remove("el-none");
      ticketCreateButton.classList.remove("el-none");
      resetFormButton.classList.remove("el-none");
    } else {
      divCustomFields.innerHTML = "";
      dropDownItems.innerHTML = "";
      itemsDiv.classList.add("el-none");
    }
  } catch (error) {
    console.log(error);
  }
});

//-------------------------------------------NESTED FIELD VARIABLES--------------------------------------------------//

dropDownItems.addEventListener("change", async function (e) {
  e.preventDefault();
  e.stopPropagation();
  dropDownFieldSections = [];
  nestedChoicesArray = [];
  let fieldDropDownNames = [];

  try {
    const fsUrlIparams = await getIparamsInfo();
    const fsCategoryURL = fsUrlIparams + "/api/v2/service_catalog/items/";
    const itemValue = dropDownItems.value;

    if (itemValue !== `Select an option`) {
      const itemID =
        dropDownItems.options[dropDownItems.selectedIndex].getAttribute(
          "data-displayId"
        );
      const ticketFields = await freshGetApi(
        fsCategoryURL,
        freshBasicAuth,
        itemID
      );
      nestedFieldName = [];
      customFields = ticketFields.service_item.custom_fields;
      // additionalItems = ticketFields.service_item
    } else {
      divCustomFields.innerHTML = "";
    }

    //-------------------------------------------CUSTOM FIELDS--------------------------------------------------//

    if (customFields) {
      divCustomFields.innerHTML = "";
      customFields.forEach((field) => {
        switch (field.field_type) {
          case "custom_text":
            divCustomFields.innerHTML += `<label for="fname">${field.name} ${
              field.required ? '<span style="color:red">*</span>' : ""
            }:</label>
              <input class ="field" type="text" id="${field.name}" name="${
              field.name
            }">`;
            break;

          case "custom_paragraph":
            divCustomFields.innerHTML += `<label for="fname">${field.name} ${
              field.required ? '<span style="color:red">*</span>' : ""
            }:</label>
              <textarea rows="4" cols="50" type="text" id="${
                field.name
              }" name="${field.name}"></textarea>`;
            break;

          case "custom_checkbox":
            divCustomFields.innerHTML += `<label for="fname">${field.name} ${
              field.required ? '<span style="color:red">*</span>' : ""
            }:</label>
              <input class ="field" type="checkbox" id="${field.name}" name="${
              field.name
            }">`;
            break;

          case "custom_number":
            divCustomFields.innerHTML += `<label for="fname">${field.name} ${
              field.required ? '<span style="color:red">*</span>' : ""
            }:</label>
              <input class ="field" type="number" id="${field.name}" name="${
              field.name
            }">`;
            break;

          case "custom_dropdown":
            divCustomFields.innerHTML += `<label for="fname">${field.name} ${
              field.required ? '<span style="color:red">*</span>' : ""
            }:</label>
              <select id="${field.name}" name="${field.name}"></select>`;
            const customFieldSelect = document.getElementById(`${field.name}`);
            field.choices.forEach((choice) => {
              customFieldSelect.innerHTML += `<option id="${choice[0]}" name="${choice[0]}">${choice[0]}</option>`;
            });
            if (field.sections) {
              fieldSectionDiv = document.createElement("div");
              fieldSectionDiv.setAttribute("id", `${field.name}-div`);
              fieldSectionDiv.setAttribute("name", `Sectiondiv`);

              divCustomFields.appendChild(fieldSectionDiv);
              fieldDropDownNames.push(field);
              fieldsSectionNames = field.sections.map(
                (f, i) => field.sections[i].name
              );
              dropDownFieldSections.push(field.sections);

              const selectedSectionOption = document.getElementById(
                `${field.name}`
              ).value;

              const selectedSection = field.sections.filter(
                (section) => selectedSectionOption == section.name
              );
              if (selectedSection.length) {
                sectionFields = selectedSection[0].fields;

                makeNestedSections(sectionFields, fieldSectionDiv);
              }
            }
            break;

          case "custom_multi_select_dropdown":
            divCustomFields.innerHTML += `<label for="fname">${field.name} ${
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
            divCustomFields.innerHTML += `<label for="fname">${field.name} ${
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
              divCustomFields
            );

            const selectedNestedCat =
              customNestedFieldSelect.options[
                customNestedFieldSelect.selectedIndex
              ].innerHTML;

            const nestedSecondChoices = nestedChoices.filter(
              (choice) => choice[0] == selectedNestedCat
            );

            const nestedSecondChoicesArray = nestedSecondChoices[0][2];

            const customSecondNestedFieldSelect = makeDropDown(
              `${field.name}-second`,
              field.nested_fields[0].name,
              nestedSecondChoicesArray,
              divCustomFields
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
              divCustomFields
            );
            break;
          //-------------------------------------------END NESTED FIELD--------------------------------------------------//

          case "custom_url":
            divCustomFields.innerHTML += `<label for="fname">${field.name}:</label>
              <input class ="field" type="url" id="${field.name}" name="${field.name}">`;
            break;

          case "custom_decimal":
            divCustomFields.innerHTML += `<label for="fname">${field.name}:</label>
              <input class ="field" type="number" id="${field.name}" name="${field.name}">`;
            break;

          case "custom_static_rich_text":
            divCustomFields.innerHTML += ``;
            break;

          case "custom_lookup_bigint":
            divCustomFields.innerHTML += `<label for="fname">Este es un campo Dinámico (lookup) y no está soportado en esta versión ${
              field.required ? '<span style="color:red">*</span>' : ""
            }:</label>`;
            break;

          default:
            divCustomFields.innerHTML += `<label for="fname">No hay campos personalizados</label>`;
        }
      });
    }

    

    // if(additionalItems.child_items.length){
    //   console.log(additionalItems.child_items.service_item_id)
    //   const fsUrlIparams = await getIparamsInfo();
    //   const fsCategoryURL = fsUrlIparams + "/api/v2/service_catalog/items/";
    //   // const ticketFields = await freshGetApi(
    //   //   fsCategoryURL,
    //   //   freshBasicAuth,
    //   //   additionalItems[0].id
    //   // );
    //   // console.log(ticketFields)

    // }



    //----------------------------------ADD EVENT LISTENER CUSTOM FIELD SECTION------------------------------------//

    if (sectionFields.length) {
      fieldDropDownNames.forEach((dropDownName, i) => {
        let sectionDiv2 = "";
        let filteredSection = [];

        document
          .getElementById(dropDownName.name)
          .addEventListener("change", (e) => {
            e.preventDefault();
            e.stopPropagation();

            document.getElementById(dropDownName.name + "-div").innerHTML = "";
            sectionDiv2 = document.getElementById(dropDownName.name + "-div");
            const selectedSectionOption = e.target.value;
            filteredSection = dropDownFieldSections[i].filter((f) => {
              return f.name == selectedSectionOption;
            });
            if (filteredSection.length) {
              sectionFields = filteredSection[0].fields;

              makeNestedSections(sectionFields, sectionDiv2);
            }
          });
      });
    }

    //------------------------------ADD EVENT LISTENER CUSTOM FIELD SECTION-----------------------------------------//

    //-------------------------------------------ADD EVENT LISTENER NESTED FIELD--------------------------------------------------//

    if (nestedFieldName.length) {
      nestedFieldName.forEach((nestedField, i) => {
        const customNestedFieldSelect = document.getElementById(nestedField);
        const customSecondNestedFieldSelect = document.getElementById(
          `${nestedField}-second`
        );
        const customThirdNestedFieldSelect = document.getElementById(
          `${nestedField}-item`
        );

        customNestedFieldSelect.addEventListener("change", function (e) {
          e.preventDefault();
          e.stopPropagation();

          const selectedNestedCat = e.target.value;

          const nestedChoices = nestedChoicesArray[i].filter(
            (c) => c[0] == selectedNestedCat
          );

          nestedSecondChoicesArray = nestedChoices[0][2];

          customSecondNestedFieldSelect.innerHTML = "";
          nestedSecondChoicesArray.forEach((choice) => {
            customSecondNestedFieldSelect.innerHTML += `<option id="${choice[0]}" name="${choice[0]}">${choice[0]}</option>`;
          });

          const nestedSecondChoices = nestedSecondChoicesArray.filter(
            (c) =>
              c[0] ==
              customSecondNestedFieldSelect.options[
                customSecondNestedFieldSelect.selectedIndex
              ].innerHTML
          );
          const nestedItems = nestedSecondChoices[0][2];

          customThirdNestedFieldSelect.innerHTML = "";
          nestedItems.forEach((choice) => {
            customThirdNestedFieldSelect.innerHTML += `<option id="${choice[0]}" name="${choice[0]}">${choice[0]}</option>`;
          });
        });

        customSecondNestedFieldSelect.addEventListener("change", function (e) {
          e.preventDefault();
          e.stopPropagation();

          const selectedSecondNestedCat = e.target.value;
          const nestedChoices2 = nestedChoicesArray[i].filter(
            (c) =>
              c[0] ==
              customNestedFieldSelect.options[
                customNestedFieldSelect.selectedIndex
              ].innerHTML
          );
          nestedChoicesArray2 = nestedChoices2[0][2];
          const nestedSecondChoices2 = nestedChoicesArray2.filter(
            (c) => c[0] == selectedSecondNestedCat
          );
          const nestedItems2 = nestedSecondChoices2[0][2];

          customThirdNestedFieldSelect.innerHTML = "";
          nestedItems2.forEach((choice) => {
            customThirdNestedFieldSelect.innerHTML += `<option id="${choice[0]}" name="${choice[0]}">${choice[0]}</option>`;
          });
        });
      });
    }
    //-------------------------------------------ADD EVENT LISTENER NESTED FIELD--------------------------------------------------//
  } catch (error) {
    console.log(error);
  }
});

//--------------------------------CREATE TICKET BUTTON -------------------------------------//
ticketCreateButton.addEventListener("click", async function (e) {
  e.preventDefault();
  e.stopPropagation();

  const arrCustomFieldsInput = Array.from(divCustomFields.children);

  let divFields = [];
  let customFieldsObject = {};

  arrCustomFieldsInput.forEach((cf) => {
    if (cf.localName == "div") {
      divFields.push(Array.from(cf.children));
      divFields.forEach((df) => {
        if (df.length) {
          makeTIcketObject(df[1], customFieldsObject);
        }
      });
    } else if (cf.name != undefined && cf.value) {
      if (cf.type == "checkbox") {
        customFieldsObject[`${cf.name}`] = cf.checked;
      } else if (
        cf.getAttribute("data-type") == "custom_multi_select_dropdown"
      ) {
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
  });
  console.log(customFieldsObject);

  try {
    const fsUrlIparams = await getIparamsInfo();
    const itemValue = dropDownItems.value;
    if (itemValue !== `Select an option`) {
      await getTicketDetails().then(async function (data) {
        const itemID =
          dropDownItems.options[dropDownItems.selectedIndex].getAttribute(
            "data-displayId"
          ); 

        await client.request
          .post(
            `${fsUrlIparams}/api/v2/service_catalog/items/${itemID}/place_request`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: freshBasicAuth,
              },
              body: JSON.stringify({
                email: data.email,
                quantity: 1,
                custom_fields: customFieldsObject,
                child_items: [],
              }),
            }
          )
          .then(
            async function (data) {
              const ticketBodyFs = JSON.parse(data.response).service_request;
              ticketCreatedPara.innerHTML = `<p><span class= "ticket-title" >Title:</span> ${ticketBodyFs.subject}</p>
              <p><span class= "ticket-title" >Ticket ID:</span> <a href="${fsUrlIparams}/helpdesk/tickets/${ticketBodyFs.id}" target ="_blank" >${ticketBodyFs.id}</a> </p>`;

              divCustomFields.innerHTML = "";
              itemsDiv.classList.add("el-none");
              categoriesDiv.classList.add("el-none");
              dropDownModule.selectedIndex = 0;
              dropDownItems.innerHTML = "";
              ticketCreateButton.classList.add("el-none");
              resetFormButton.classList.add("el-none");
            },
            function (error) {
              console.log(error);
              dropDownItems.innerHTML = "";
              ticketCreatedPara.innerHTML = JSON.parse(
                error.response
              ).errors.map(
                (err) =>
                  `Error : </br> <p> Field :${err.field}</br> Error Description: ${err.message} </p>`
              );
              divCustomFields.innerHTML = "";
              dropDownModule.selectedIndex = 0;
              itemsDiv.classList.add("el-none");
              categoriesDiv.classList.add("el-none");
              ticketCreateButton.classList.add("el-none");
              resetFormButton.classList.add("el-none");
            }
          );
      });
    } else {
      ticketCreatedPara.innerHTML = "<p> Debes seleccionar un Item </p>";
    }
  } catch (error) {
    console.log(error);
  }
});

resetFormButton.addEventListener("click", () => {
  divCustomFields.innerHTML = "";
  dropDownModule.selectedIndex = 0;
  itemsDiv.classList.add("el-none");
  categoriesDiv.classList.add("el-none");
  ticketCreateButton.classList.add("el-none");
  resetFormButton.classList.add("el-none");
});


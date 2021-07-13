const domSystem = require("./domSystem.js");

exports.getModalInput = (modal) => {
    if (!modal) return;
    const inputs = modal.getElementsByTagName("input");
    const returnObj = { };
    for (let i = 0; i < inputs.length; i++) {
        returnObj[inputs[i].id] = inputs[i].value;
    }
    return returnObj;
}

exports.alert = (message) => {
  exports.createModal(`<p>${message}</p><button class="alert-button">Ok</button>`, ((modal) => {
    // const alertButtons = document.getElementsByClassName("alert");
    // const button = alertButtons[alertButtons[alertButtons.length - 1]];
    const button = modal.querySelector(".alert-button");
    button.addEventListener("click", () => {
      exports.closeModal(modal.parentNode.parentNode);
    })
  }), true, true, true, "20%");
}

exports.prompt = (prompt) => {
  const promptModal = exports.createModal(`<p>${prompt}</p><br /><input class="prompt-input" /><br /><button class="prompt-button">Ok</button>`, null, true, false, true, "20%");
  return promptModal;
}


// exports.createModal = (content, functionCall, centered = false, mandatory = false, top = false, width) => {

//   //modal
//   const modal = document.createElement("DIV");
//   modal.classList.add("modal");

//   modal.mandatory = mandatory;

//   document.body.appendChild(modal);

//   console.log(modal);

//   document.activeElement.blur();


//   //check if multiple modals, and closes them if there is

//   const modalList = document.getElementsByClassName("modal");

//   // if (modalList.length === 2) {
//   //   if (!modalList[0].mandatory) {
//   //     exports.closeModal(modalList[0]);
//   //   } else {
//   //     exports.closeModal(modalList[1]);
//   //     return;
//   //   }
//   // }

//   //modal content
//   const modalContent = document.createElement("DIV");
//   modalContent.classList.add("modal-content");

 

//   if (width) {
//     modalContent.style.width = width;
//   }
//   // modalContent.style.transform = "scale(0, 0)";

//   modal.appendChild(modalContent);

//   if (!mandatory) {
//     modal.addEventListener("click", (event) => {
//       if (event.target !== modal) return;
//       exports.closeModal(modal);
//     });
//     //modal close button
//     const modalClose = document.createElement("SPAN");
//     modalClose.classList.add("modal-close");
//     modalClose.innerHTML = "✕";


//     modalClose.addEventListener("click", (event) => {
//       if (event.target !== modalClose) return;
//       exports.closeModal(modal);
//     });
//     modalContent.appendChild(modalClose);

//   }

//   modalContent.appendChild(domSystem.strToNode(content));

//   const innerModal = modalContent.querySelector(".modal-content-inner");

//   if (centered) {
//     innerModal.classList.add("centered");
//   }

//   //updating values for elements who need value updating
//   [...modalContent.children].forEach((element) => {
//     if (element.classList.contains("show-value")) {
//       element.addEventListener("input", () => {
//         domSystem.updateModalValue(element);
//       });
//     }
//   });

//   //checks if there's a function call that goes along with the modal
//   if (functionCall) {
//     //yes, I know, it's confusing
//     functionCall(innerModal);
//   }

//   if (top) {
//       console.log(window.getComputedStyle(modalContent).height)
//       modalContent.style.top = "-" + (parseInt(window.getComputedStyle(modalContent).height.slice(0, -2)) + 115) + "px"; //add 20
//       setTimeout(() => {
//         modalContent.style.top = "0px";
//       }, 10);
//   }

//   return modal;

// }

// exports.closeModal = (modal) => {
//   console.log("Closing a modal...");
//   //not necessary, but ok
//   modal.style.display = "none";
//   domSystem.removeElement(modal);
// }

// exports.checkModal = () => {
//   //checks if there's at least one modal
//   if (document.getElementsByClassName("modal").length > 0) {
//     return true;
//   }
//   return false;
// }
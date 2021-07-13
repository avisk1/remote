exports.strToNode = (str) => {
  //converts a string of html to an actual html node
  if (str.includes("<script")) {
    console.warn("Don't be an idiot and remove that script!");
  }
  //THREE LINES!?
  const content = document.createElement("DIV");
  content.classList.add("modal-content-inner");
  content.innerHTML = str;
  return content;
}

//No idea if I even use this; it looks kind of useless
//never mind, apparently it isn't?
//never mind again, it definitely is useless
exports.updateModalValue = (element) => {
  if (element.tagName.toLowerCase() !== "input") {
    console.warn("Not an input element");
    return;
  }
  try {
    const textValue = element.parentNode.getElementsByClassName("input-value")[0];
    textValue.innerHTML = element.value + "%";
  } catch (err) {
    console.warn("Can't find \"input-value\"");
    return;
  }
}

//No.
exports.removeElement = (element) => {
  if (element.parentNode) {
    element.parentNode.removeChild(element);
  } else {
    console.warn("Element has no parent. ???");
  }
}

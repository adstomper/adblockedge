/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

(function()
{
  let progressBar, canvas, headers;

  function onLoad()
  {
    window.removeEventListener("load", onLoad, false);

    // Init global variables
    progressBar = document.getElementById("progressBar");
    canvas = document.getElementById("progressBarCanvas");

    headers = Array.prototype.slice.call(progressBar.getElementsByTagName("label"));
    for (let i = 0; i < headers.length; i++)
      canvas.parentNode.appendChild(headers[i]);

    // Expose properties
    Object.defineProperty(progressBar, "activeItem",
    {
      get: getActiveItem,
      set: setActiveItem
    });
    Object.defineProperty(progressBar, "activeItemComplete",
    {
      get: getActiveItemComplete,
      set: setActiveItemComplete
    });

    // Run actual drawing delayed, once the sizes are fixed
    window.setTimeout(init, 0);
  };
  window.addEventListener("load", onLoad, false);

  function init()
  {
    const gapWidth = 5;
    const arrowheadWidth = 5;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    let context = canvas.getContext("2d");
    context.fillStyle = window.getComputedStyle(progressBar, "").color;
    context.strokeStyle = window.getComputedStyle(progressBar, "").color;
    context.lineWidth = 1;

    let panelCount = headers.length;
    let panelWidth = (width - gapWidth * (panelCount - 1) - 1) / panelCount;
    for (let i = 0; i < panelCount; i++)
    {
      context.save();
      context.translate(Math.round(i * (panelWidth + gapWidth)) + 0.5, 0.5);
      context.beginPath();
      if (i)
        context.moveTo(-arrowheadWidth, 0);
      else
        context.moveTo(0, 0);
      context.lineTo(panelWidth - arrowheadWidth, 0);
      context.lineTo(panelWidth, (height - 1) / 2);
      context.lineTo(panelWidth - arrowheadWidth, height - 1);
      if (i)
      {
        context.lineTo(-arrowheadWidth, height - 1);
        context.lineTo(0, (height - 1) / 2);
        context.lineTo(-arrowheadWidth, 0);
      }
      else
      {
        context.lineTo(0, height - 1);
        context.lineTo(0, 0);
      }
      context.stroke();
      context.restore();

      let childLeft = Math.round(i * (panelWidth + gapWidth) + 1);
      let childWidth = panelWidth - arrowheadWidth - 2;
      let child = headers[i];
      child.style.marginLeft = childLeft + "px";
      child.style.marginRight = (width - childLeft - childWidth) + "px";
      child.style.width = childWidth + "px";
    }

    // Resize after initialization should be ignored
    canvas.parentNode.removeAttribute("flex");
  }

  function getActiveItem()
  {
    for (let i = 0; i < headers.length; i++)
    {
      let header = headers[i];
      if (header.classList.contains("active"))
        return header;
    }
    return null;
  }

  function setActiveItem(val)
  {
    let complete = true;
    for (let i = 0; i < headers.length; i++)
    {
      let header = headers[i];
      if (header == val)
        complete = false;

      if (!complete && header.value[0] == "✔")
        header.value = header.value.replace(/^✔\s*/, "");
      else if (complete && header.value[0] != "✔")
        header.value = "✔ " + header.value;

      if (header == val)
        header.classList.add("active");
      else
        header.classList.remove("active");
    }
  }

  function getActiveItemComplete()
  {
    let activeItem = this.activeItem;
    if (!activeItem)
      return false;
    else
      return activeItem.value[0] == "✔";
  }

  function setActiveItemComplete(val)
  {
    let activeItem = this.activeItem;
    if (!activeItem)
      return;

    if (!val && activeItem.value[0] == "✔")
      activeItem.value = activeItem.value.replace(/^✔\s*/, "");
    else if (val && activeItem.value[0] != "✔")
      activeItem.value = "✔ " + activeItem.value;
  }
})();

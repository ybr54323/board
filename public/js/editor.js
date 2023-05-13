const editor = document.querySelector("#editor");
const button = document.querySelector("#submit");

const axios = new window.axios.create();
/**
 * 
 * 
 * 

 */
function insertAfter(newElement, targetElement) {
  const parentElement = targetElement.parentElement;
  if (parentElement.lastChild === targetElement) {
    parentElement.appendChild(newElement);
  } else {
    parentElement.insertBefore(newElement, targetElement.nextSibling);
  }
}
const rules = [
  // # foo
  ["h", /(#+)(\s|&nbsp;)(\w+)?/g],
  // *foo*
  ["*", /(\*+)([^\s\*]+)\1\s/g],
  // // 1. foo
  ["ol", /\d+\.(\s|&nbsp;)\S+/g],
  // // - foo
  ["dl", /-(\s|&nbsp;)\S+/g],
  // // ~foo~
  ["~", /(~+)\w+\1(\s|&nbsp;)/g],
  // // `foo`
  ["`", /(`+)\w+\1(\s|&nbsp;)/g],
];

window.onload = function () {
  const editor = document.querySelector("#editor");
  editor.addEventListener("keypress", function (e) {
    setTimeout(() => {
      const { key } = e;
      if (key === "Enter") {
      } else {
        const selection = window.getSelection();
        console.log(selection.anchorNode.data)
        const data = selection.anchorNode.data;

        const tokens = [];
        for (let i = 0; i < rules.length; i++) {
          const [tag, rule] = rules[i];
          let exec;
          while ((exec = rule.exec(data))) {
            tokens.push([tag, exec]);
          }
        }

        let temp = "";

        for (let i = 0, len = tokens.length; i < len; i++) {
          const [tag, exec] = tokens[i];
          const { input, index } = exec;

          if (i === 0) temp += input.slice(0, index);
          if (tag === "*") {
            temp += marked.parseInline(exec[0]);
          }
          if (tag === "h") {
            temp += marked.parse(exec[0] + "\u200b");
          }
          if (tag === "~") {
            temp += marked.parseInline(exec[0]);
          }
          if (tag === 'ol' || tag === 'dl') {
            temp += marked.parse(exec[0])
          }
          if (i >= 0 && i < len - 1) {
            const [nextTag, nextExec] = tokens[i + 1];
            const { index: nextIndex } = nextExec;
            // 到下一个token的间隙
            temp += input.slice(index + exec[0].length, nextIndex);
          }
          if (i === len - 1) temp += input.slice(index + exec[0].length);
        }
        if (temp) {
          const elm = document.createElement("span");
          elm.innerHTML = temp;
          selection.anchorNode.parentElement.insertBefore(
            elm,
            selection.anchorNode
          );
          selection.anchorNode.remove();
        }
        // selection.collapse(
        //   selection.anchorNode.parentElement,
        //   [...selection.anchorNode.parentElement.childNodes].indexOf(elm)
        // );
      }
    });
  });
  const f = document.querySelector("#board");

  editor.addEventListener("paste", (e) => {
    const selection = window.getSelection();
    const { anchorNode } = selection;
    const { parentElement } = anchorNode;

    const data = (e.clipboardData || window.clipboardData).items || [];

    const fileReader = new FileReader();

    for (var i = 0; i < data.length; i += 1) {
      if (data[i].kind == "string" && data[i].type.match("^text/plain")) {
        // 遍历拖拽项的内容
        data[i].getAsString(function (s) {
          e.target.appendChild(document.getElementById(s));
        });
      } else if (data[i].kind == "string" && data[i].type.match("^text/html")) {
        // 拖拽项的数据是 HTML
        console.log("... Drop: HTML");
      } else if (
        data[i].kind == "string" &&
        data[i].type.match("^text/uri-list")
      ) {
        // 拖拽项的数据是 URI
        console.log("... Drop: URI");
      } else if (data[i].kind == "file" && data[i].type.match("^image/")) {
        // 拖拽项的数据是一个图片
        var f = data[i].getAsFile();
        console.log("... Drop: File ");

        fileReader.onload = function (e) {
          var img = new Image();
          img.src = e.target.result;
          // if (parentElement) {
          //   parentElement.insertBefore(img, anchorNode.nextSibling);
          // } else {
          // }
          editor.appendChild(img);
        };

        fileReader.readAsDataURL(f);
      }
    }
  });

  button.addEventListener("click", function (e) {
    const content = editor.innerHTML;
    const nameRegexp = /(?<=editor\/)[^\/]+/;
    let defaultName;
    (defaultName = window.location.href.match(nameRegexp)) &&
      ([defaultName] = defaultName);

    const name = window.prompt("输入name", defaultName || "");

    axios({
      url: "/editor",
      method: "post",
      data: {
        name,
        content,
      },
    }).then((res) => {
      console.warn(res);
    });
  });
};

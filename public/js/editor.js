const editor = document.querySelector("#editor");
const button = document.querySelector("#submit");

const axios = new window.axios.create();

const rules = [
  // # foo
  ["h", /(#+)(\s|&nbsp;)(\w+)?/g],
  // *foo*
  ["*", /(\*+)([^\s\*]+)\1\s/g],
  //  1. foo
  ["ol", /\d+\.(\s|&nbsp;)\S+/g],
  //  - foo
  ["dl", /-(\s|&nbsp;)\S+/g],
  //  ~foo~
  ["~", /(~+)\w+\1(\s|&nbsp;)/g],
  //  `foo`
  ["`", /(`+)\w+\1(\s|&nbsp;)/g],
  /**
   * foo
   * ---
   * /
   * foo
   * ===
   */
  ["-", /(-+)(\s|&nbsp;)/g],
  ["=", /(=+)(\s|&nbsp;)/g],
];

window.onload = function () {
  const editor = document.querySelector("#editor");

  function findLine(node) {
    while (
      node &&
      !node.previousElementSibling &&
      node.parentElement !== editor
    ) {
      node = node.parentElement;
    }
    return node;
  }
  const board = document.querySelector("#board");

  editor.addEventListener("keypress", function (e) {
    
    setTimeout(() => {
      const { key } = e;
      if (key === "Enter") {
        
      } else {
        const selection = window.getSelection();
        const data = selection.anchorNode.data;

        const temp = rules.reduce(function (result, [tag, rule]) {
          return result.replace(rule, function (match, p1) {
            if (tag === "h") return marked.parse(match + "\u200b");
            if (tag === "*") return marked.parseInline(match);
            if (tag === "ol" || tag === "dl") return marked.parse(match);
            if (tag === "~") return marked.parseInline(match);
            if (tag === "`") return marked.parseInline(match);
            if (tag === "-" || tag === "=") {
              setTimeout(() => {
                const preLine = findLine(
                  selection.anchorNode
                ).previousElementSibling;
                if (!preLine || !preLine.innerHTML) return;
                const temp = preLine.innerHTML + "\n" + p1;
                console.log(temp);
                preLine.innerHTML = marked.parse(temp);
                selection.anchorNode.remove();
                selection.collapse(preLine, 1);
              });
              return match;
            }
          });
        }, data);
        if (temp === data) return;
        const elm = document.createElement("span");
        elm.innerHTML = temp;

        console.warn()
        selection.anchorNode.parentElement.insertBefore(
          elm,
          selection.anchorNode
        );

        selection.anchorNode.remove();
      }
    });
  });

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

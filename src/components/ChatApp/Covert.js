import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import React from 'react';

let TABLE_KEY = 0;

window.to_text = function(data) {
	// 將字串按照換行符號分割成數組
  const lines = data['content'].split('\n');

  // 使用 Array.map 遍歷每一行，轉換為 <span> 元素，同時插入 <br> 元素
  const elements = lines.map((line, index) => (
    <React.Fragment key={index}>
      <span>{line}</span>
      {index !== lines.length - 1 && <br />} {/* 插入 <br>，除了最後一行之外的每一行後都插入 */}
    </React.Fragment>
  ));

  return <div>{elements}</div>; // 將結果包裝在 <div> 元素中
}

window.to_image = function(data) {
	let src = `data:image/png;base64,${data['base64']}`;

	return (<img src={src} />);
}

window.to_link = function(data) {
	return (<a href={data['url']} target='_blank'>
				{data['content']}
			</a>);
}

window.to_code = function(data) {
	return (
    <SyntaxHighlighter language={data['language']} style={tomorrow}>
      {data['content']}
    </SyntaxHighlighter>
  );
}

window.to_table = function(data){
  TABLE_KEY += 1;
  let colspan = 1;

  return (
    <table key={`table${TABLE_KEY}`}>
      {'thead' in data && <thead key={`thead${TABLE_KEY}`}><tr><td colSpan={data['tbody'].length}>{data['thead']}</td></tr></thead>}
      {'tbody' in data &&
        <tbody key={`tbody${TABLE_KEY}`}>
          {data['tbody'].map((row, rowIndex) => (
            <tr key={`${TABLE_KEY}-row-${rowIndex}`}>
              {row.map((cell, cellIndex) => {
                if (cell === 'colspan') {
                  colspan++;
                  return null;
                } else {
                  const tdContent =
                    colspan !== 1 ? (
                      <td colSpan={colspan} key={`${TABLE_KEY}-cell-${rowIndex}-${cellIndex}`}>
                        {cell}
                      </td>
                    ) : (
                      <td key={`${TABLE_KEY}-cell-${rowIndex}-${cellIndex}`}>{cell}</td>
                    );

                  colspan = 1;
                  return tdContent;
                }
              })}
            </tr>
          ))}
        </tbody>
      }
      { 'tfoot' in data &&
        <tfoot>{data['tfoot']}</tfoot>
      }
    </table>
  );
}

window.to_button = function(data) {
	return (
		<button onClick={data['function']}>
			{data['content']}
		</button>
	);
}

// 計算 button 連續到第幾個 index 即可
export function count_continuous_button(res, start){
	for(let i=start; i<res.length; i++){
		if(res[i]["ui_type"]=="button"){
			continue;
		}
		else{
			return i-1;
		}
	}
	return res.length-1
}

export function covert_to_html(function_name, ...args) {
  const globalScope = window; // 在瀏覽器環境中使用 window 物件

  // 檢查函數是否存在且可呼叫
  if (function_name in globalScope && typeof globalScope[function_name] === 'function') {
    // 呼叫函數
    const functionToCall = globalScope[function_name];
    return functionToCall(...args);
  } else {
    // 丟出錯誤
    throw new Error(`Function '${function_name}' not found or not callable.`);
  }
}

export function covert_to_gpt_entity(dict){
	let content = "";
	const keys = Object.keys(dict);

	keys.forEach(key => {
    const value = dict[key];
    content += `${value}, `;
  });
  
  // 移除最後一個逗號
  content = content.slice(0, -2);

	return content;
}
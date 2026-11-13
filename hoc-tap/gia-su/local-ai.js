let loading;
export async function loadModel(report){
 if(!navigator.gpu)throw new Error('Thiết bị chưa hỗ trợ WebGPU.');
 const adapter=await navigator.gpu.requestAdapter();
 if(!adapter)throw new Error('Trình duyệt chưa truy cập được GPU.');
 const model=adapter.features.has('shader-f16')?'Qwen2.5-1.5B-Instruct-q4f16_1-MLC':'Qwen2.5-1.5B-Instruct-q4f32_1-MLC';
 loading??=import('https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.88/lib/index.js').then(({CreateMLCEngine})=>CreateMLCEngine(model,{initProgressCallback:report})).catch(error=>{loading=undefined;throw error;});
 return loading;
}
export async function explain(engine,{question,grade,subject,mode,materials,previous}){
 const guidance={basic:'Giải thích dễ hiểu và thêm một ví dụ ngắn.',practice:'Chỉ đưa gợi ý từng bước. Chừa bước cuối để học sinh tự làm.',advanced:'Trình bày cách giải, điều kiện áp dụng và kiểm tra kết quả.'};
 const context=materials.map(x=>x.title+'\n'+x.rule+'\nVí dụ: '+x.example.prompt+' '+x.example.solution+' Đáp án: '+x.example.answer).join('\n\n');
 const messages=[
  {role:'system',content:'Bạn là gia sư MaxNgo cho học sinh. Chỉ trả lời câu hỏi học tập bằng tiếng Việt phù hợp lớp đã chọn. Ưu tiên học liệu cho sẵn, kiểm tra phép tính và đơn vị. Nếu thiếu dữ kiện hãy hỏi lại; nếu không chắc hãy nói rõ. Không yêu cầu thông tin cá nhân, không hướng dẫn thí nghiệm nguy hiểm. Không bịa nguồn hay liên kết. Trả lời ngắn, tối đa khoảng 180 từ.'},
  ...previous.flatMap(x=>[{role:'user',content:x.question},{role:'assistant',content:x.answer}]),
  {role:'user',content:'Môn '+subject+', lớp '+grade+'. '+guidance[mode]+'\n\nHọc liệu:\n'+context+'\n\nCâu hỏi:\n'+question}
 ];
 const result=await engine.chat.completions.create({messages,temperature:0.2,max_tokens:650});
 return result.choices[0]?.message?.content?.trim() || '';
}

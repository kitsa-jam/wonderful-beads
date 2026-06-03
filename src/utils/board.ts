export const boardLabel = (row:number, col:number, boardSize=29) => `${String.fromCharCode(65+Math.floor(row/boardSize))}${Math.floor(col/boardSize)+1}`;
export const boardCount = (w:number,h:number, boardSize=29) => Math.ceil(w/boardSize)*Math.ceil(h/boardSize);
export const boardPresets = [{label:'1 块板 29x29',w:29,h:29},{label:'2x2 块板 58x58',w:58,h:58},{label:'3x3 块板 87x87',w:87,h:87},{label:'4x4 块板 116x116',w:116,h:116},{label:'5x5 块板 145x145',w:145,h:145},{label:'6x6 块板 174x174',w:174,h:174}];
export const canvasPresets = [[16,16],[26,26],[32,32],[40,30],[50,50],[52,52],[64,64],[80,80],[100,100],[128,128],[256,256]] as const;

export default function dateConvert(a,b,tugas){
  let c, d
  if(tugas){
  	c = new Date(a.deadline.split('/').reverse().join('/')).getTime()
  	d = new Date(b.deadline.split('/').reverse().join('/')).getTime()
  }else{
  	c = new Date(a.created.split('/').reverse().join('/')).getTime()
  	d = new Date(b.created.split('/').reverse().join('/')).getTime()
  }
  return [c,d]
}

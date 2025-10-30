let a = null;

const test = () => {
  try{
    a = 'old value'
    return a
  }finally{
    a = 'new value'
  }
}

const result = test()

console.log(result)
console.log(a)
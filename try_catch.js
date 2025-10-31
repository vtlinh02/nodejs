/*
  what do you want to do?

  1. Order execution between return and finally
  2. what happen if return after throw
*/

let a = null;

const inside = () => {
  try{
    a = 'old value'
    return a
  } finally {
    a = 'new value'
  }
}

const main = () => {
  try {
    const value = inside()
    console.log(value)
    console.log(a)
  } catch(err) {
    console.log('Got ERROR from main')
  }
}

main()
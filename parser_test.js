function parse(string){
  // Step 1. Replace multiple whitespaces with single space.
  // Step 2. Replace newline characters with single space.
  // Step 3: Clear whitespaces from the beggining
  // Step 4: Clear whitespaces from the end
  let s = string.replace(/\s+/g, ' ').replace(/\n+/g, " ").replace(/^[ ]+/g, "").replace(/[ ]+$/g, "")
  return s;
}

const _text = '\n' +
  '        Haldiram Punjabi tadka namkeen can add zing to your bored taste buds. Filled with the goodness and spiciness of the rich culture of Punjab.\n' +
  '        '

console.log(parse(_text))
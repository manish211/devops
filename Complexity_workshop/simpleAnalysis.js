function traverse(object, visitor) 
{
    var key, child
    // console.log("ONE ONE")

    visitor.call(null, object)

    // console.log("TWO TWO")
    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key]

            if (typeof child === 'object' && child !== null) {
                traverse(child, visitor)
            }
        }
    }
}
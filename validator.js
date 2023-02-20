class JsonValidator {
    constructor(schema) {
        this.result = {}
        this.result.isError = false
        this.result.message = "";
        this.schema = schema

    }
    validate(val, childSchema, keyName) {
        if (childSchema) this.schema = childSchema

        Object.entries(this.schema).forEach((entries) => {
            const [keys, values] = entries

            if (!Object.keys(val).includes(keys) && !values.required) {
                delete this.schema[keys]
            }
        })

        Object.keys(val).some((keys) => {
            if (!Object.keys(this.schema).includes(keys)) {
                this.result.message = `${keyName ? `${keyName}.` : ""}${keys} is not allowed`
                this.result.isError = true
                return true;
            }
        })
        if (this.result.message) return this.result

        Object.entries(this.schema).some((element, index) => {
            const [keys, values] = element
            if (values.required && !Object.keys(val).includes(keys)) {
                this.result.message = `${keyName ? `${keyName}.` : ""}${keys} is required`
                this.result.isError = true
                return true
            }
            else if (values.type === "date") {
                if (String(new Date(val[keys])) === "Invalid Date") {
                    this.result.message = `${keyName ? `${keyName}.` : ""}${keys} should be ${values.type} format`;
                    this.result.isError = true;
                    return true;
                }
            }
            else if (values.type === "array") {
                if (!Array.isArray(val[keys])) {
                    this.result.message = `${keyName ? `${keyName}.` : ""}${keys} should be ${values.type}`;
                    this.result.isError = true;
                    return;
                }
                else if (values?.element) {
                    if (values?.element?.type === "object") {
                        val[keys].forEach((val, index) => {
                            this.validate(val, values?.element?.schema, `${keys}.[${index}]`);
                        })
                        return;
                    }
                    else {
                        val[keys].some((val, index) => {
                            if (typeof val !== values?.element?.type) {
                                this.result.message = `${keys}.[${index}] should be ${values.element.type}`;
                                this.result.isError = true;
                                return true
                            }
                        })
                    }
                }
                return true
            }
            else if (values.type === "object" && values?.schema && Object?.values(values?.schema)?.length) {
                this.validate(val[keys], values.schema, keys)
            }
            else if (typeof val[keys] !== values.type) {
                this.result.message = `${keyName ? `${keyName}.` : ""}${keys} should be ${values.type}`
                this.result.isError = true
                return true
            }
        })

        if (this.result.message) return this.result
        else {
            delete this.result.message
            return this.result
        }
    }

}

const dataSchema = { id: { type: "number", required: true } }
const variantSchema = {
    id: { type: "string", required: true },
    unit: { type: "number", required: false },
    variantName: { type: "string", required: true },
    isNeeded: { type: "boolean", required: true }
}


// Here is the schema for the data model.
const schema = {
    variant: { type: "array", element: { type: "object", schema: variantSchema }, required: true },
    hobbies: { type: "array", required: false },
    // accNo: { type: "array", required: false },
    name: { type: "string", required: true },
    startDate: { type: "date", required: true },
    age: { type: "number", required: true },
    isActive: { type: "boolean", required: true },
    data: { type: "object", schema: dataSchema, required: true },
    endDate: { type: "date", required: true },
}

// Here is the payload data.
const payload = {
    
    age: 1,
    isActive: false,
    startDate: "2023-02-18T12:53:42.121Z",
    endDate: "2023-02-18j",
    hobbies:[],
    data: { id: 4 },
    // accNo: [true, false, true],
    variant: [
        {
            id: "123",
            unit: 10,
            variantName: "hj",
            isNeeded: false
        },
        {
            id: "456",
            unit: 5,
            variantName: "fsdf",
            isNeeded: false
        },
        {
            id: "789",
            unit: 10,
            variantName: "fsdf",
            isNeeded: false
        }
    ],
    name: 5,
}

// Calling the validaation method.
// Here in "JsonValidator" method we should pass the schema,
// And in the "validate" method we should pass the data which is to be validated.

const newObj = new JsonValidator(schema).validate(payload)
console.log(newObj);

// The result will be an object
//  {
//     isError: false                            (If there is no error.)
//  }
//  {
//     isError: true,                            (If there is error.)
//     message:"{field_name} should be {type}."
//  }
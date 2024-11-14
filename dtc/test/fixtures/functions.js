export const noArgs = () => true

export const syncFunction = (args) => args

export const asyncFunction = async (args) => args

export const functionWithException = (__args) => {
    throw new Error()
}

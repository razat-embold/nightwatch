window.addEventListener('generate-browser-context', async (event) => {
    const [domJson, domStrings] = await GET_SNAPSHOT();
    console.log("domJson: ", domJson); 
    console.log("domStrings: ", domStrings);
    const element = { detail: { data: domStrings, domJson: domJson }}
    function1(element);
})
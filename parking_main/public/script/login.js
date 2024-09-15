
function validateForm(){
 
    if(document.getElementById("txt-username").value === ""){
        showError(document.getElementById("message")," Emailad  is mandatory.");
        return false;
    }
    if(document.getElementById("pwd").value == ""){
        showError(document.getElementById("message")," Password is mandatory.");
        return false;
    }
    return true;    
}

function showError(msgElement, errMsg){
    resetMessageElement(msgElement);
    msgElement.textContent="Failed! "+errMsg;
    msgElement.classList.add("error");
    msgElement.style.display="block";
}
function resetMessageElement(msgElement){
    msgElement.textContent="";
    msgElement.classList.remove("success");
    msgElement.classList.remove("error");
    msgElement.style.display="none";
}
function submitForm( ) {
    if( validateForm()){
    // event.preventDefault(); // Prevent the default form submission
     const url="https://google.com"
    // Get the form element
    const form = document.getElementById("fm").target;

    // Create a FormData object from the form
    const formData = new FormData(form);

    // Send the form data using the Fetch API
    fetch(url, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
}


// Example usage: Attach this function to a form's submit event

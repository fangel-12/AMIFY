let selectedRole = 'farmer';

function setRole(role){
  selectedRole = role;
  document.getElementById('roleFarmer').classList.toggle('active', role==='farmer');
  document.getElementById('roleBuyer').classList.toggle('active', role==='buyer');
  document.getElementById('cropField').style.display = role==='farmer' ? 'block' : 'none';
}

function handleSignup(e) {
    e.preventDefault();
    window.location.href = "login.html";
    return false;
}
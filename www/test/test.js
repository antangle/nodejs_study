// api URL, https 프로토콜 사용에 유의
const API_URL = "https://api.aptioncompany.com";

// graphql query 문
const getAllSmartPhones = () => 
`{
    allSmartphones {
        model
        modelKr
    }
}`;

// mutation query 문 -> input을 넣을 때 사용
const createAccount = (loginId, password, nickname) =>
`mutation {
    createAccount(loginId: "${loginId}", password: "${password}", nickname: "${nickname}") {
        buyer {
            id
            loginId
            password
            nickname
        }
    }
}`;

const login = (loginId, password) =>
`mutation{
    login(loginId: "${loginId}", password: "${password}") {
      token
    }
}`;


// 결과를 HTML에 띄우기
const renderSmartPhones = (res) => {
    const output0 = document.getElementById("output0");
    const { allSmartphones } = res.data;
    output0.innerHTML = JSON.stringify(allSmartphones);
}

// 결과를 HTML에 띄우기
const renderCreateAccountResult = (res) => {
    const output = document.getElementById("output4");
    if (res.data) {
        const { createAccount } = res.data;
        output.innerHTML = JSON.stringify(createAccount);
    } else {
        output.innerHTML = "해당 아이디로 이미 가입이 되어있습니다"
    }
}

const renderLoginResult = (res) => {
    const output = document.getElementById("output5");
    if (res.data) {
        const { login } = res.data;
        output.innerHTML = JSON.stringify(login);
    } else {
        output.innerHTML = "아이디 및 비밀번호가 잘못되었습니다"
    }
}

// graphQL Client 함수 정의
const gqlClient = (queryBuilder, resolver) => {
    // fetch에 넣어줄 option, POST방식으로 바디에 graphql 쿼리를 넣어준다.
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(
            {
                query: queryBuilder()
            }
        )
    };

    // fetch 후 결과 반영
    fetch(API_URL, options)
        .then(res => res.json())
        .then(resolver)
        .catch(err => console.error(err));
};

function init() {
    gqlClient(getAllSmartPhones, renderSmartPhones);
}


function test2(){
    alert("test2!!");
}

function test4() {
    gqlClient(() => createAccount("user5","user5pw","user5"), renderCreateAccountResult);
}

function test5() {
    gqlClient(() => login("user2", "user2pw"), renderLoginResult);
}
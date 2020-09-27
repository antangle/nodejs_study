const const_NULL = -2;
const const_SUCCESS = 1;
const const_DEAD = -1;

const payload_user = {
    notification: {
        title: "새 경매",
        body: "새로운 경매가 올라왔습니다. 지금 확인하세요~"
    }
}

const payload_store = {
    notification: {
        title: "경매 낙찰",
        body: "내가 제시한 딜이 낙찰되었어요! 내 입찰>지난 입찰에서 확인하세요~"
    }
}

const payload_admin_user = {
    notification: {
        title: "유저 1:1문의",
        body: "새로운 문의가 들어왔습니다"
    }
}

const payload_admin_store = {
    notification: {
        title: "파트너 1:1문의",
        body: "새로운 문의가 들어왔습니다"
    }
}

const option_user = {
    dryRun: true
}

const options_store = {
    dryRun: true
}

const option_admin = {
    dryRun: true
}


module.exports = {
    const_NULL: const_NULL,
    const_SUCCESS: const_SUCCESS,
    const_DEAD: const_DEAD,
    
    
    payload_user,
    payload_store,
    
    payload_admin_user,
    payload_admin_store,
    
    option_user,
    options_store,
    option_admin,
};
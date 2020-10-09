const const_NULL = -2;
const const_SUCCESS = 1;
const const_DEAD = -1;

const payload_user = {
    notification: {
        title: "새 경매",
        body: "새로운 경매가 올라왔습니다. 지금 확인하세요~"
    }
}

const payload_user_higherAuction = {
    notification: {
        title: "경매 갱신",
        body: "더 높은 할인 금액을 제시한 입찰이 들어왔어요. 지금 확인해보세요."
    }
}

const payload_store = {
    notification: {
        title: "경매 낙찰",
        body: "축하합니다~ 사장님께서 제시한 경매가 낙찰되었어요!"
    }
}

const payload_store_higherAuction = {
    notification: {
        title: "경매 갱신",
        body: "경쟁자가 나타났어요! 현재 경매가보다 더 좋은 조건을 제시하세요!"
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
    dryRun: false
}

const options_store = {
    dryRun: false
}

const option_admin = {
    dryRun: false
}


module.exports = {
    const_NULL: const_NULL,
    const_SUCCESS: const_SUCCESS,
    const_DEAD: const_DEAD,
    
    
    payload_user,
    payload_store,
    
    payload_user_higherAuction,
    payload_store_higherAuction,

    payload_admin_user,
    payload_admin_store,
    
    option_user,
    options_store,
    option_admin,
};
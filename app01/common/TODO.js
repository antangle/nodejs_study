/* TODO:
Buy 쪽 쿼리와 알고리즘 시간나면 갈아버릴것.
!일단 패스!
Buy STEP 3 에서 공시지원금이 존재하지 않는 요금제 뱉을때 아예 뺴버리기.
@해결

아 그리고 하루 넘게지나도 경매 3개이상 생성안되는것 같은데 확인부탁해욤
@해결

get201StateUpdate 함수에서 마감시간이 지나도 result를 1 항상 뱉음
@해결

202에서 리뷰 작성되어있는지 여부 확인하는거랑 연락처 확인 부탁!
@해결, score_id 가 있다면 작성되있고, null이라면 1개도 없는것임, phone 값 넣어둠.

203, 204 딜이 없어도 옥션 정보(디바이스 네임, finishtime) 받아올수 있게 따로 해주세요
@203 해결. 딜없으면 deal, store, score(평점) 관련내용 전부 null 뜨고, auction 관련 내용만 뜰거임.

203, 204 재입찰할 경우 이전딜이 사라짐
!이건 s202dealsend에서 처리해야됨!

210 get210InfoForReview => store_id말고 store_nick 뱉어주삼
@해결

210 postReview => 이상하게 잘 안됨, 가끔보면 전체리뷰 리스트에 새로 만든 딜이 있고, '리뷰 test입니당~'이라는 내용으로 들어가있음
@해결, 원래 그거 나오게 test 자료 하나 만든거임.

212 스토어 리뷰 리스트 - deal_id로 받게 만들고 deal의 store_nick은 리뷰가 없어도 따로 무조건 뱉고, writer_nick도 추가해주세용
@writer_nick 가아닌 user_nick으로 하겠음, 

S201,301 더이상 보지 않기 버튼을 눌렀음에도 계속 뜸(state가 -1로 안바뀌는것으로 확인), 근데 특정상황(재입찰 하면)에서 state가 그냥 -1로 변함, 그러면 301에서는 안뜨는데 201에서는 뜸 ;
@해결

S301 한번 입찰하면 경매 마감시간이 끝나도 계속 뜸
@해결

200번대에서 신고하기 기능?

401 => 최근 본 기종도 호출
@해결. step1에서 고른 기종 이름, 브랜드이름, 이미지url 제공

404 닉네임이 안바뀜 result 9041에러
@해결

405 주소바꾸기 할때 본래 주소 보여주기
@해결 /web01/user/api/locationInfo405 로 user_id 보내면서 요청

오픈소스 라이센스 정보 모아놓은거 있는지 ??
@현재 할필요 없대용

S202AuctionDealSend에서 -7022 왜뜰까
@해결.

S303MyDealDetail 에러 result-709
@갈아서 아마 안나올듯?

S101에서 공지사항 추가
@일단 프론트에서 처리됨

web01에서 login 관련 push_token 값 아예 못건드리게 해놓을것.

Pooling 에 관하여 pool 개수 조정
!일단 주말에

*/

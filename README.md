### 영화와 관련된 정보를 한곳에 'Fromto' 앱 개발  

![image](https://user-images.githubusercontent.com/88662101/230560579-408cb4c4-a478-4b24-8608-d7d0ee49dc97.png)  


<br>
<br>

### Folder Structure
- `src`: 메인 로직 
- `config` 및 `util` 폴더: 메인 로직은 아니지만 `src` 에서 필요한 부차적인 파일들을 모아놓은 폴더
- 도메인 폴더 구조
> Route - Controller - Provider/Service - DAO

- Route: Request에서 보낸 라우팅 처리
- Controller: Request를 처리하고 Response 해주는 곳. (Provider/Service에 넘겨주고 다시 받아온 결과값을 형식화), 형식적 Validation
- Provider/Service: 비즈니스 로직 처리, 의미적 Validation
- DAO: Data Access Object의 줄임말. Query가 작성되어 있는 곳. 
 
#### Node.js (패키지매니저 = npm)
> Request(시작) / Response(끝)  ⇄ Router (*Route.js) ⇄ Controller (*Controller.js) ⇄ Service (CUD) / Provider (R) ⇄ DAO (DB)


```
├── config                              #
│   ├── baseResponseStatus.js           # Response 시의 Status들을 모아 놓은 곳. 
│   ├── database.js                     # 데이터베이스 관련 설정
│   ├── express.js                      # express Framework 설정 파일
│   ├── jwtMiddleware.js                # jwt 관련 미들웨어 파일
│   ├── secret.js                       # 서버 key 값들 
│   └── winston.js                      # logger 라이브러리 설정
├── * log                               # 생성된 로그 폴더
├── * node_modules                    	# 외부 라이브러리 폴더 (package.json 의 dependencies)
├── src                     			# 
│   ├── app              				# 앱에 대한 코드 작성
│   │   ├── User            			# User 도메인 폴더
│   │ 	│   ├── userRoute.js          	# routing 처리 
│   │ 	│   ├── userDao.js          	# User 관련 데이터베이스
│   │ 	│   ├── userController.js 		# req, res 처리
│   │ 	│   ├── userProvider.js   		# R에 해당하는 서버 로직 처리
│   │ 	│   └── userService.js   		# CUD에 해당하는 서버 로직 처리  
Create(생성), Read(읽기), Update(갱신), Delete(삭제) 
├── .gitignore                     		# git 에 포함되지 않아야 하는 폴더, 파일들을 작성 해놓는 곳
├── index.js                            # 포트 설정 및 시작 파일                     		
├── * package-lock.json              	 
├── package.json                        # 프로그램 이름, 버전, 필요한 모듈 등 노드 프로그램의 정보를 기술
└── README.md
```


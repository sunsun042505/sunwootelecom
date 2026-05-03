import { getStore, connectLambda } from "@netlify/blobs";
import crypto from "crypto";

const STORE_NAME = "neverlab-telecom-cs";
const DB_KEY = "main";

const planPrices = {
  "SKT 5GX 프리미엄": 109000,
  "SKT 5GX 프라임플러스": 99000,
  "SKT 5GX 프라임": 89000,
  "SKT 5GX 레귤러플러스": 79000,
  "SKT 5GX 레귤러": 69000,
  "SKT 5G 베이직플러스": 59000,
  "SKT 5G 베이직": 49000,
  "SKT 다이렉트5G 76": 76000,
  "SKT 다이렉트5G 69": 69000,
  "SKT 다이렉트5G 62": 62000,
  "SKT 다이렉트5G 55": 55000,
  "SKT 다이렉트5G 48": 48000,
  "SKT 0청년 109": 109000,
  "SKT 0청년 99": 99000,
  "SKT 0청년 79": 79000,
  "SKT 0청년 69": 69000,
  "SKT 0청년 59": 59000,
  "SKT 0틴 5G": 45000,
  "SKT 5G ZEM 퍼펙트": 36000,
  "SKT 주말엔 팅 3GB": 41000,
  "SKT LTE 데이터ON 프리미엄": 89000,
  "SKT LTE 데이터ON 스탠다드": 69000,
  "SKT LTE 세이브": 33000,
  "SKT 시니어 안심 4GB": 22000,
  "SKT 복지 5G 라이트": 33000,
  "KT 5G 스페셜": 100000,
  "KT 5G 베이직": 80000,
  "KT 5G 심플 110GB": 69000,
  "KT 5G 심플 70GB": 65000,
  "KT 5G 심플 50GB": 63000,
  "KT 5G 심플 30GB": 61000,
  "KT 5G 슬림 21GB": 55000,
  "KT 5G 슬림 14GB": 47000,
  "KT 5G 슬림 10GB": 45000,
  "KT 5G 슬림 4GB": 37000,
  "KT 5G 슬림 이월 21GB": 56000,
  "KT 5G 슬림 이월 14GB": 48000,
  "KT LTE 데이터ON 프리미엄": 89000,
  "KT LTE 데이터ON 비디오": 69000,
  "KT LTE 데이터ON 톡": 49000,
  "KT LTE 베이직": 33000,
  "KT LTE Y 무제한": 69000,
  "KT LTE Y 10GB": 49000,
  "KT LTE Y 2.5GB": 33000,
  "KT 시니어 베이직": 22000,
  "KT 시니어 데이터안심": 33000,
  "KT 복지 데이터안심": 33000,
  "KT 키즈 알 115": 28000,
  "KT 군인 Y군인 77": 77000,
  "KT 군인 Y군인 55": 55000,
  "U+ 5G 시그니처": 130000,
  "U+ 5G 프리미어 슈퍼": 115000,
  "U+ 5G 프리미어 플러스": 105000,
  "U+ 5G 프리미어 레귤러": 95000,
  "U+ 5G 프리미어 에센셜": 85000,
  "U+ 5G 스탠다드": 75000,
  "U+ 5G 데이터 슈퍼": 68000,
  "U+ 5G 데이터 플러스": 61000,
  "U+ 5G 라이트+": 55000,
  "U+ 5G 라이트": 47000,
  "U+ 다이렉트 5G 69": 69000,
  "U+ 다이렉트 5G 59": 59000,
  "U+ 다이렉트 5G 51": 51000,
  "U+ 다이렉트 5G 44": 44000,
  "U+ LTE 프리미어 플러스": 89000,
  "U+ LTE 추가요금 걱정없는 데이터 69": 69000,
  "U+ LTE 추가요금 걱정없는 데이터 59": 59000,
  "U+ LTE 데이터 33": 33000,
  "U+ 청소년 5G 라이트": 45000,
  "U+ 키즈 5G": 29000,
  "U+ 시니어 5G 안심": 45000,
  "U+ 시니어 LTE 안심": 33000,
  "U+ 복지 LTE 라이트": 22000,
  "U+ 현역병 5G 55": 55000,
  "U+ 태블릿 5G 4GB": 22000,
  "알뜰 LTE 1GB 100분": 3900,
  "알뜰 LTE 3GB 200분": 5900,
  "알뜰 LTE 6GB 350분": 9900,
  "알뜰 LTE 7GB+1Mbps": 19800,
  "알뜰 LTE 10GB+1Mbps": 22000,
  "알뜰 LTE 11GB+2GB+3Mbps": 33000,
  "알뜰 LTE 15GB 350분": 22000,
  "알뜰 LTE 15GB+3Mbps": 27500,
  "알뜰 LTE 100GB+5Mbps": 39900,
  "알뜰 5G 9GB": 19000,
  "알뜰 5G 30GB": 27500,
  "알뜰 5G 50GB": 33000,
  "알뜰 5G 100GB": 44000,
  "알뜰 5G 무제한": 55000,
  "네버랩 5G 스타터": 29000,
  "네버랩 5G 라이트": 39000,
  "네버랩 5G 베이직": 49000,
  "네버랩 5G 스탠다드": 59000,
  "네버랩 5G 프리미엄": 79000,
  "네버랩 LTE 절약 1GB": 9900,
  "네버랩 LTE 실속 5GB": 19900,
  "네버랩 LTE 안심 10GB": 29900,
  "네버랩 시니어 안심콜": 14900,
  "네버랩 복지할인 라이트": 19900,
  "네버랩 현역병 안심 55": 55000
};

const DEFAULT_PLAN_CATALOG = [
  {
    "name": "SKT 5GX 프리미엄",
    "price": 109000,
    "category": "5G",
    "active": true,
    "benefits": [
      "T 우주/미디어 제휴 혜택 대상",
      "멤버십/청년 제휴 혜택",
      "OTT/뮤직 선택 혜택 가능"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "SKT 5GX 프라임플러스",
    "price": 99000,
    "category": "5G",
    "active": true,
    "benefits": [
      "T 우주/미디어 제휴 혜택 대상",
      "멤버십/청년 제휴 혜택",
      "OTT/뮤직 선택 혜택 가능"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "SKT 5GX 프라임",
    "price": 89000,
    "category": "5G",
    "active": true,
    "benefits": [
      "T 우주/미디어 제휴 혜택 대상",
      "멤버십/청년 제휴 혜택",
      "OTT/뮤직 선택 혜택 가능"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "SKT 5GX 레귤러플러스",
    "price": 79000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "SKT 5GX 레귤러",
    "price": 69000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "SKT 5G 베이직플러스",
    "price": 59000,
    "category": "5G",
    "active": true,
    "benefits": [
      "티빙/지니/밀리/디즈니+ 계열 선택 혜택",
      "OTT 계정 등록 필요",
      "멤버십/제휴 할인 가능"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "SKT 5G 베이직",
    "price": 49000,
    "category": "5G",
    "active": true,
    "benefits": [
      "티빙/지니/밀리/디즈니+ 계열 선택 혜택",
      "OTT 계정 등록 필요",
      "멤버십/제휴 할인 가능"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "SKT 다이렉트5G 76",
    "price": 76000,
    "category": "5G",
    "active": true,
    "benefits": [
      "T 우주/미디어 제휴 혜택 대상",
      "멤버십/청년 제휴 혜택",
      "OTT/뮤직 선택 혜택 가능"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "SKT 다이렉트5G 69",
    "price": 69000,
    "category": "5G",
    "active": true,
    "benefits": [
      "T 우주/미디어 제휴 혜택 대상",
      "멤버십/청년 제휴 혜택",
      "OTT/뮤직 선택 혜택 가능"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "SKT 다이렉트5G 62",
    "price": 62000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "SKT 다이렉트5G 55",
    "price": 55000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "SKT 다이렉트5G 48",
    "price": 48000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "SKT 0청년 109",
    "price": 109000,
    "category": "기타",
    "active": true,
    "benefits": [
      "T 우주/미디어 제휴 혜택 대상",
      "멤버십/청년 제휴 혜택",
      "OTT/뮤직 선택 혜택 가능"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "SKT 0청년 99",
    "price": 99000,
    "category": "기타",
    "active": true,
    "benefits": [
      "T 우주/미디어 제휴 혜택 대상",
      "멤버십/청년 제휴 혜택",
      "OTT/뮤직 선택 혜택 가능"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "SKT 0청년 79",
    "price": 79000,
    "category": "기타",
    "active": true,
    "benefits": [
      "T 우주/미디어 제휴 혜택 대상",
      "멤버십/청년 제휴 혜택",
      "OTT/뮤직 선택 혜택 가능"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "SKT 0청년 69",
    "price": 69000,
    "category": "기타",
    "active": true,
    "benefits": [
      "T 우주/미디어 제휴 혜택 대상",
      "멤버십/청년 제휴 혜택",
      "OTT/뮤직 선택 혜택 가능"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "SKT 0청년 59",
    "price": 59000,
    "category": "기타",
    "active": true,
    "benefits": [
      "T 우주/미디어 제휴 혜택 대상",
      "멤버십/청년 제휴 혜택",
      "OTT/뮤직 선택 혜택 가능"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "SKT 0틴 5G",
    "price": 45000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "SKT 5G ZEM 퍼펙트",
    "price": 36000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "SKT 주말엔 팅 3GB",
    "price": 41000,
    "category": "기타",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "SKT LTE 데이터ON 프리미엄",
    "price": 89000,
    "category": "LTE",
    "active": true,
    "benefits": [
      "티빙/지니/밀리/디즈니+ 계열 선택 혜택",
      "OTT 계정 등록 필요",
      "멤버십/제휴 할인 가능",
      "T 우주/미디어 제휴 혜택 대상",
      "멤버십/청년 제휴 혜택",
      "OTT/뮤직 선택 혜택 가능"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "SKT LTE 데이터ON 스탠다드",
    "price": 69000,
    "category": "LTE",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "SKT LTE 세이브",
    "price": 33000,
    "category": "LTE",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "SKT 시니어 안심 4GB",
    "price": 22000,
    "category": "기타",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "SKT 복지 5G 라이트",
    "price": 33000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "KT 5G 스페셜",
    "price": 100000,
    "category": "5G",
    "active": true,
    "benefits": [
      "티빙/지니/밀리/디즈니+ 계열 선택 혜택",
      "OTT 계정 등록 필요",
      "멤버십/제휴 할인 가능"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "KT 5G 베이직",
    "price": 80000,
    "category": "5G",
    "active": true,
    "benefits": [
      "티빙/지니/밀리/디즈니+ 계열 선택 혜택",
      "OTT 계정 등록 필요",
      "멤버십/제휴 할인 가능"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "KT 5G 심플 110GB",
    "price": 69000,
    "category": "5G",
    "active": true,
    "benefits": [
      "티빙/지니/밀리/디즈니+ 계열 선택 혜택",
      "OTT 계정 등록 필요",
      "멤버십/제휴 할인 가능"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "KT 5G 심플 70GB",
    "price": 65000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "KT 5G 심플 50GB",
    "price": 63000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "KT 5G 심플 30GB",
    "price": 61000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "KT 5G 슬림 21GB",
    "price": 55000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "KT 5G 슬림 14GB",
    "price": 47000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "KT 5G 슬림 10GB",
    "price": 45000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "KT 5G 슬림 4GB",
    "price": 37000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "KT 5G 슬림 이월 21GB",
    "price": 56000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "KT 5G 슬림 이월 14GB",
    "price": 48000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "KT LTE 데이터ON 프리미엄",
    "price": 89000,
    "category": "LTE",
    "active": true,
    "benefits": [
      "티빙/지니/밀리/디즈니+ 계열 선택 혜택",
      "OTT 계정 등록 필요",
      "멤버십/제휴 할인 가능"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "KT LTE 데이터ON 비디오",
    "price": 69000,
    "category": "LTE",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "KT LTE 데이터ON 톡",
    "price": 49000,
    "category": "LTE",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "KT LTE 베이직",
    "price": 33000,
    "category": "LTE",
    "active": true,
    "benefits": [
      "티빙/지니/밀리/디즈니+ 계열 선택 혜택",
      "OTT 계정 등록 필요",
      "멤버십/제휴 할인 가능"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "KT LTE Y 무제한",
    "price": 69000,
    "category": "LTE",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "KT LTE Y 10GB",
    "price": 49000,
    "category": "LTE",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "KT LTE Y 2.5GB",
    "price": 33000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "KT 시니어 베이직",
    "price": 22000,
    "category": "기타",
    "active": true,
    "benefits": [
      "티빙/지니/밀리/디즈니+ 계열 선택 혜택",
      "OTT 계정 등록 필요",
      "멤버십/제휴 할인 가능"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "KT 시니어 데이터안심",
    "price": 33000,
    "category": "기타",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "KT 복지 데이터안심",
    "price": 33000,
    "category": "기타",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "KT 키즈 알 115",
    "price": 28000,
    "category": "기타",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "KT 군인 Y군인 77",
    "price": 77000,
    "category": "기타",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "KT 군인 Y군인 55",
    "price": 55000,
    "category": "기타",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "U+ 5G 시그니처",
    "price": 130000,
    "category": "5G",
    "active": true,
    "benefits": [
      "OTT/VOD 할인팩 대상",
      "유튜브 프리미엄/디즈니+/티빙 할인 계열",
      "U+ 콘텐츠 제휴 혜택"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "U+ 5G 프리미어 슈퍼",
    "price": 115000,
    "category": "5G",
    "active": true,
    "benefits": [
      "OTT/VOD 할인팩 대상",
      "유튜브 프리미엄/디즈니+/티빙 할인 계열",
      "U+ 콘텐츠 제휴 혜택"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "U+ 5G 프리미어 플러스",
    "price": 105000,
    "category": "5G",
    "active": true,
    "benefits": [
      "OTT/VOD 할인팩 대상",
      "유튜브 프리미엄/디즈니+/티빙 할인 계열",
      "U+ 콘텐츠 제휴 혜택"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "U+ 5G 프리미어 레귤러",
    "price": 95000,
    "category": "5G",
    "active": true,
    "benefits": [
      "OTT/VOD 할인팩 대상",
      "유튜브 프리미엄/디즈니+/티빙 할인 계열",
      "U+ 콘텐츠 제휴 혜택"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "U+ 5G 프리미어 에센셜",
    "price": 85000,
    "category": "5G",
    "active": true,
    "benefits": [
      "OTT/VOD 할인팩 대상",
      "유튜브 프리미엄/디즈니+/티빙 할인 계열",
      "U+ 콘텐츠 제휴 혜택"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "U+ 5G 스탠다드",
    "price": 75000,
    "category": "5G",
    "active": true,
    "benefits": [
      "OTT/VOD 할인팩 대상",
      "유튜브 프리미엄/디즈니+/티빙 할인 계열",
      "U+ 콘텐츠 제휴 혜택"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "U+ 5G 데이터 슈퍼",
    "price": 68000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "U+ 5G 데이터 플러스",
    "price": 61000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "U+ 5G 라이트+",
    "price": 55000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "U+ 5G 라이트",
    "price": 47000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "U+ 다이렉트 5G 69",
    "price": 69000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "U+ 다이렉트 5G 59",
    "price": 59000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "U+ 다이렉트 5G 51",
    "price": 51000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "U+ 다이렉트 5G 44",
    "price": 44000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "U+ LTE 프리미어 플러스",
    "price": 89000,
    "category": "LTE",
    "active": true,
    "benefits": [
      "OTT/VOD 할인팩 대상",
      "유튜브 프리미엄/디즈니+/티빙 할인 계열",
      "U+ 콘텐츠 제휴 혜택"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "U+ LTE 추가요금 걱정없는 데이터 69",
    "price": 69000,
    "category": "LTE",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "U+ LTE 추가요금 걱정없는 데이터 59",
    "price": 59000,
    "category": "LTE",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "U+ LTE 데이터 33",
    "price": 33000,
    "category": "LTE",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "U+ 청소년 5G 라이트",
    "price": 45000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "U+ 키즈 5G",
    "price": 29000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "U+ 시니어 5G 안심",
    "price": 45000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "U+ 시니어 LTE 안심",
    "price": 33000,
    "category": "LTE",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "U+ 복지 LTE 라이트",
    "price": 22000,
    "category": "LTE",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "U+ 현역병 5G 55",
    "price": 55000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "U+ 태블릿 5G 4GB",
    "price": 22000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "알뜰 LTE 1GB 100분",
    "price": 3900,
    "category": "LTE",
    "active": true,
    "benefits": [
      "기본 혜택 없음",
      "저가 실속형"
    ],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "알뜰 LTE 3GB 200분",
    "price": 5900,
    "category": "LTE",
    "active": true,
    "benefits": [
      "기본 혜택 없음",
      "저가 실속형"
    ],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "알뜰 LTE 6GB 350분",
    "price": 9900,
    "category": "LTE",
    "active": true,
    "benefits": [
      "기본 혜택 없음",
      "저가 실속형"
    ],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "알뜰 LTE 7GB+1Mbps",
    "price": 19800,
    "category": "LTE",
    "active": true,
    "benefits": [
      "기본 혜택 없음",
      "저가 실속형"
    ],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "알뜰 LTE 10GB+1Mbps",
    "price": 22000,
    "category": "LTE",
    "active": true,
    "benefits": [
      "기본 혜택 없음",
      "저가 실속형"
    ],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "알뜰 LTE 11GB+2GB+3Mbps",
    "price": 33000,
    "category": "LTE",
    "active": true,
    "benefits": [
      "대용량 데이터 혜택",
      "제휴/프로모션형 OTT 혜택 가능"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "알뜰 LTE 15GB 350분",
    "price": 22000,
    "category": "5G",
    "active": true,
    "benefits": [
      "기본 혜택 없음",
      "저가 실속형"
    ],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "알뜰 LTE 15GB+3Mbps",
    "price": 27500,
    "category": "5G",
    "active": true,
    "benefits": [
      "기본 혜택 없음",
      "저가 실속형"
    ],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "알뜰 LTE 100GB+5Mbps",
    "price": 39900,
    "category": "LTE",
    "active": true,
    "benefits": [
      "대용량 데이터 혜택",
      "제휴/프로모션형 OTT 혜택 가능"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "알뜰 5G 9GB",
    "price": 19000,
    "category": "5G",
    "active": true,
    "benefits": [
      "기본 혜택 없음",
      "저가 실속형"
    ],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "알뜰 5G 30GB",
    "price": 27500,
    "category": "5G",
    "active": true,
    "benefits": [
      "기본 혜택 없음",
      "저가 실속형"
    ],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "알뜰 5G 50GB",
    "price": 33000,
    "category": "5G",
    "active": true,
    "benefits": [
      "기본 혜택 없음",
      "저가 실속형"
    ],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "알뜰 5G 100GB",
    "price": 44000,
    "category": "5G",
    "active": true,
    "benefits": [
      "대용량 데이터 혜택",
      "제휴/프로모션형 OTT 혜택 가능"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "알뜰 5G 무제한",
    "price": 55000,
    "category": "5G",
    "active": true,
    "benefits": [
      "대용량 데이터 혜택",
      "제휴/프로모션형 OTT 혜택 가능"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "네버랩 5G 스타터",
    "price": 29000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "네버랩 5G 라이트",
    "price": 39000,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "네버랩 5G 베이직",
    "price": 49000,
    "category": "5G",
    "active": true,
    "benefits": [
      "네버랩 미디어 라이트",
      "VOD 쿠폰 월 1회",
      "뮤직 할인"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "네버랩 5G 스탠다드",
    "price": 59000,
    "category": "5G",
    "active": true,
    "benefits": [
      "네버랩 미디어 라이트",
      "VOD 쿠폰 월 1회",
      "뮤직 할인"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "네버랩 5G 프리미엄",
    "price": 79000,
    "category": "5G",
    "active": true,
    "benefits": [
      "네버랩 미디어팩",
      "OTT 1종 선택",
      "뮤직 스트리밍 할인",
      "클라우드 100GB"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "네버랩 LTE 절약 1GB",
    "price": 9900,
    "category": "LTE",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "네버랩 LTE 실속 5GB",
    "price": 19900,
    "category": "5G",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "네버랩 LTE 안심 10GB",
    "price": 29900,
    "category": "LTE",
    "active": true,
    "benefits": [],
    "hasBenefits": false,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "네버랩 시니어 안심콜",
    "price": 14900,
    "category": "기타",
    "active": true,
    "benefits": [
      "시니어 안심콜",
      "스팸차단",
      "위치안심 부가서비스"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "네버랩 복지할인 라이트",
    "price": 19900,
    "category": "기타",
    "active": true,
    "benefits": [
      "복지할인 대상",
      "기본료 할인",
      "상담 우선 연결"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  },
  {
    "name": "네버랩 현역병 안심 55",
    "price": 55000,
    "category": "기타",
    "active": true,
    "benefits": [
      "현역병 전용",
      "휴가 데이터 쿠폰",
      "영상통화 할인"
    ],
    "hasBenefits": true,
    "sourceNote": "CS 시뮬레이터용 혜택 매핑"
  }
];
const DEFAULT_INVENTORY = [
  {
    "type": "USIM",
    "name": "일반 USIM",
    "model": "NEVER-USIM-01",
    "stock": 120,
    "status": "사용가능"
  },
  {
    "type": "eSIM",
    "name": "eSIM 프로파일",
    "model": "NEVER-ESIM",
    "stock": 300,
    "status": "사용가능"
  },
  {
    "type": "단말기",
    "name": "iPhone 17 Pro Max",
    "model": "A-17PM-256",
    "stock": 5,
    "status": "사용가능"
  },
  {
    "type": "단말기",
    "name": "iPhone 17 Pro",
    "model": "A-17P-256",
    "stock": 6,
    "status": "사용가능"
  },
  {
    "type": "단말기",
    "name": "iPhone Air",
    "model": "A-AIR-256",
    "stock": 4,
    "status": "사용가능"
  },
  {
    "type": "단말기",
    "name": "Samsung Galaxy S26 Ultra",
    "model": "S26U-256",
    "stock": 8,
    "status": "사용가능"
  },
  {
    "type": "단말기",
    "name": "Samsung Galaxy S26",
    "model": "S26-256",
    "stock": 10,
    "status": "사용가능"
  },
  {
    "type": "단말기",
    "name": "Samsung Galaxy Z Fold7",
    "model": "ZF7-512",
    "stock": 3,
    "status": "사용가능"
  },
  {
    "type": "단말기",
    "name": "Samsung Galaxy Z Flip7",
    "model": "ZFLIP7-256",
    "stock": 7,
    "status": "사용가능"
  },
  {
    "type": "단말기",
    "name": "Google Pixel 10 Pro",
    "model": "P10P-256",
    "stock": 4,
    "status": "사용가능"
  }
];
const DEFAULT_KB = [
  {
    "category": "요금",
    "title": "미납 안내 스크립트",
    "content": "고객님, 현재 미납 요금이 확인됩니다. 납부 처리 후 서비스 이용 제한이 해제될 수 있습니다."
  },
  {
    "category": "번호이동",
    "title": "번호이동 사전동의 안내",
    "content": "기존 통신사 인증 또는 사전동의가 필요합니다. 명의자 정보와 기존 통신사 정보를 확인해 주세요."
  },
  {
    "category": "신분증",
    "title": "신분증 재촬영 요청",
    "content": "신분증 사진이 흐리거나 빛 반사가 있으면 반려될 수 있습니다. 전체 영역이 선명하게 나오도록 재촬영해 주세요."
  },
  {
    "category": "USIM",
    "title": "USIM 인식 불가 조치",
    "content": "전원 재부팅, USIM 재장착, 단말 네트워크 초기화를 안내하고 계속 안 되면 재발급 접수하세요."
  },
  {
    "category": "eSIM",
    "title": "eSIM 재발급 안내",
    "content": "기기 변경 또는 초기화 후 eSIM 재발급이 필요할 수 있습니다. QR 또는 프로파일 발급 상태를 확인하세요."
  }
];


function json(statusCode, data) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS"
    },
    body: JSON.stringify(data)
  };
}

async function readBody(event) {
  try {
    return event.body ? JSON.parse(event.body) : {};
  } catch {
    return {};
  }
}

function emptyDB() {
  return {
    branches: [],
    employees: [],
    sessions: [],
    customers: [],
    logs: [],
    consultations: [],
    tickets: [],
    applications: [],
    bills: [],
    serviceOrders: [],
    catalogPlans: [],
    inventory: [],
    mobileTracking: [],
    notifications: [],
    knowledgeBase: [],
    workQueue: [],
    callbacks: [],
    auditLogs: []
  };
}

async function readDB(store) {
  const data = await store.get(DB_KEY, { type: "json" }) || emptyDB();
  data.branches ||= [];
  data.employees ||= [];
  data.sessions ||= [];
  data.customers ||= [];
  data.logs ||= [];
  data.consultations ||= [];
  data.tickets ||= [];
  data.applications ||= [];
  data.bills ||= [];
  data.serviceOrders ||= [];
  data.catalogPlans ||= [];
  data.inventory ||= [];
  data.mobileTracking ||= [];
  data.notifications ||= [];
  data.knowledgeBase ||= [];
  data.workQueue ||= [];
  data.callbacks ||= [];
  data.auditLogs ||= [];
  if (!data.catalogPlans.length) data.catalogPlans = DEFAULT_PLAN_CATALOG.map(x => ({ ...x }));
  if (!data.inventory.length) data.inventory = DEFAULT_INVENTORY.map(x => ({ ...x, id: crypto.randomUUID() }));
  if (!data.knowledgeBase.length) data.knowledgeBase = DEFAULT_KB.map(x => ({ ...x, id: crypto.randomUUID(), createdAt: now() }));
  return data;
}

async function writeDB(store, data) {
  await store.setJSON(DB_KEY, data);
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, originalHash] = stored.split(":");
  const candidate = hashPassword(password, salt).split(":")[1];
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(originalHash));
}

function tokenSecret() {
  return process.env.NEVERLAB_TOKEN_SECRET || "neverlab-dev-token-secret-change-later";
}

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function signToken(payload) {
  const body = base64url(JSON.stringify(payload));
  const sig = crypto
    .createHmac("sha256", tokenSecret())
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

function verifyToken(token) {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = crypto
    .createHmac("sha256", tokenSecret())
    .update(body)
    .digest("base64url");

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload.branchId || !payload.employeeId) return null;
    return payload;
  } catch {
    return null;
  }
}

function now() {
  return new Date().toISOString();
}

function addLog(data, { branchId, employeeId, branchName, employeeName, action }) {
  data.logs.push({
    id: crypto.randomUUID(),
    branchId,
    employeeId,
    branchName,
    employeeName,
    action,
    createdAt: now()
  });
}

function getToken(event) {
  const header = event.headers.authorization || event.headers.Authorization || "";
  return header.replace("Bearer ", "").trim();
}

function getSession(data, event) {
  const token = getToken(event);
  const payload = verifyToken(token);
  if (!payload) return null;

  const branch = data.branches.find(b => b.id === payload.branchId);
  const employee = data.employees.find(e => e.id === payload.employeeId);

  if (!branch || !employee) return null;

  return {
    token,
    branchId: branch.id,
    branchName: branch.branchName,
    employeeId: employee.id,
    employeeName: employee.employeeName,
    role: employee.role
  };
}

function requireSession(data, event) {
  const session = getSession(data, event);
  if (!session) {
    const err = new Error("로그인이 필요해.");
    err.statusCode = 401;
    throw err;
  }
  return session;
}

function mapCustomer(c) {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone,
    plan: c.plan,
    monthlyFee: c.monthlyFee,
    unpaid: c.unpaid,
    status: c.status,
    usage: {
      data: c.dataGb,
      call: c.callMinutes,
      sms: c.smsCount
    },
    createdAt: c.createdAt
  };
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return json(200, { ok: true });
  }

  try {
    connectLambda(event);
    const store = getStore(STORE_NAME);

    const path = event.path.replace("/.netlify/functions/api", "") || "/";
    const method = event.httpMethod;
    const data = await readDB(store);

    if (method === "POST" && path === "/signup/branch") return await signupBranch(event, data, store);
    if (method === "POST" && path === "/signup/employee") return await signupEmployee(event, data, store);
    if (method === "POST" && path === "/login") return await login(event, data, store);
    if (method === "POST" && path === "/logout") return await logout(event, data, store);

    if (method === "GET" && path === "/me") return await me(event, data);
    if (method === "GET" && path === "/branches") return await listBranches(data);

    if (method === "GET" && path === "/dashboard") return await dashboard(event, data);
    if (method === "GET" && path === "/customers") return await listCustomers(event, data);
    if (method === "POST" && path === "/customers") return await createCustomer(event, data, store);
    if (method === "PATCH" && path.startsWith("/customers/")) return await updateCustomer(event, path, data, store);
    if (method === "GET" && path === "/logs") return await listLogs(event, data);
    if (method === "POST" && path === "/line-complete") return await lineComplete(event, data, store);
    if (method === "POST" && path === "/device-change-complete") return await deviceChangeComplete(event, data, store);

    if (method === "GET" && path.startsWith("/customers/")) return await customerDetail(event, path, data, store);
    if (method === "POST" && path.startsWith("/consultations")) return await createConsultation(event, data, store);
    if (method === "GET" && path === "/consultations") return await listConsultations(event, data);

    if (method === "POST" && path === "/tickets") return await createTicket(event, data, store);
    if (method === "GET" && path === "/tickets") return await listTickets(event, data);
    if (method === "PATCH" && path.startsWith("/tickets/")) return await updateTicket(event, path, data, store);

    if (method === "GET" && path === "/applications") return await listApplications(event, data);
    if (method === "PATCH" && path.startsWith("/applications/")) return await updateApplication(event, path, data, store);

    if (method === "POST" && path === "/billing/generate") return await generateBills(event, data, store);
    if (method === "GET" && path === "/billing") return await listBills(event, data);
    if (method === "PATCH" && path.startsWith("/billing/")) return await updateBill(event, path, data, store);

    if (method === "POST" && path === "/plan-change") return await planChange(event, data, store);
    if (method === "POST" && path === "/addons") return await addonChange(event, data, store);
    if (method === "POST" && path === "/usim-reissue") return await usimReissue(event, data, store);

    if (method === "GET" && path === "/employees") return await listEmployees(event, data);
    if (method === "PATCH" && path.startsWith("/employees/")) return await updateEmployeeRole(event, path, data, store);

    if (method === "GET" && path === "/catalog/plans") return await listCatalogPlans(event, data);
    if (method === "POST" && path === "/catalog/plans") return await upsertCatalogPlan(event, data, store);
    if (method === "PATCH" && path.startsWith("/catalog/plans/")) return await toggleCatalogPlan(event, path, data, store);

    if (method === "GET" && path === "/inventory") return await listInventory(event, data);
    if (method === "POST" && path === "/inventory") return await addInventory(event, data, store);
    if (method === "PATCH" && path.startsWith("/inventory/")) return await updateInventory(event, path, data, store);

    if (method === "GET" && path === "/mobile-tracking") return await listMobileTracking(event, data);
    if (method === "POST" && path === "/mobile-tracking") return await createMobileTracking(event, data, store);
    if (method === "PATCH" && path.startsWith("/mobile-tracking/")) return await updateMobileTracking(event, path, data, store);

    if (method === "GET" && path === "/notifications") return await listNotifications(event, data);
    if (method === "POST" && path === "/notifications") return await sendNotification(event, data, store);

    if (method === "GET" && path === "/knowledge") return await listKnowledge(event, data);
    if (method === "POST" && path === "/knowledge") return await addKnowledge(event, data, store);

    if (method === "PATCH" && path === "/customers/benefit") return await changeCustomerBenefit(event, data, store);

    if (method === "GET" && path === "/branch-performance") return await branchPerformance(event, data);

    if (method === "GET" && path === "/customers-advanced") return await advancedCustomerSearch(event, data);
    if (method === "PATCH" && path === "/line-status") return await updateLineStatus(event, data, store);
    if (method === "POST" && path === "/penalty-calc") return await penaltyCalc(event, data);
    if (method === "POST" && path === "/installments") return await setInstallment(event, data, store);

    if (method === "GET" && path === "/work-queue") return await listWorkQueue(event, data);
    if (method === "POST" && path === "/work-queue") return await createWorkQueue(event, data, store);
    if (method === "PATCH" && path.startsWith("/work-queue/")) return await updateWorkQueue(event, path, data, store);

    if (method === "GET" && path === "/callbacks") return await listCallbacks(event, data);
    if (method === "POST" && path === "/callbacks") return await createCallback(event, data, store);
    if (method === "PATCH" && path.startsWith("/callbacks/")) return await updateCallback(event, path, data, store);

    if (method === "GET" && path === "/audit-logs") return await listAuditLogs(event, data);

    return json(404, { ok: false, message: "없는 API 주소야." });
  } catch (error) {
    console.error(error);
    return json(error.statusCode || 500, {
      ok: false,
      message: error.message || "서버 오류가 발생했어."
    });
  }
}

async function signupBranch(event, data, store) {
  const body = await readBody(event);
  const branchName = String(body.branchName || "").trim();
  const branchCode = String(body.branchCode || "").trim();

  if (!branchName || !branchCode) {
    return json(400, { ok: false, message: "지점명과 지점 코드를 입력해줘." });
  }

  const exists = data.branches.some(b =>
    normalize(b.branchName) === normalize(branchName) ||
    normalize(b.branchCode) === normalize(branchCode)
  );

  if (exists) {
    return json(409, { ok: false, message: "이미 등록된 지점명 또는 지점 코드야." });
  }

  const branch = {
    id: crypto.randomUUID(),
    branchName,
    branchCode,
    createdAt: now()
  };

  data.branches.push(branch);

  addLog(data, {
    branchId: branch.id,
    employeeId: null,
    branchName,
    employeeName: "SYSTEM",
    action: "지점 가입"
  });

  await writeDB(store, data);
  return json(201, { ok: true, message: "지점 가입 완료!" });
}

async function signupEmployee(event, data, store) {
  const body = await readBody(event);
  const branchName = String(body.branchName || "").trim();
  const employeeName = String(body.employeeName || "").trim();
  const password = String(body.password || "");
  const role = body.role === "manager" ? "manager" : "staff";

  if (!branchName || !employeeName || password.length < 4) {
    return json(400, { ok: false, message: "지점, 직원명, 4자 이상 비밀번호를 입력해줘." });
  }

  const branch = data.branches.find(b => b.branchName === branchName);

  if (!branch) {
    return json(404, { ok: false, message: "등록되지 않은 지점이야." });
  }

  const duplicate = data.employees.some(e =>
    e.branchId === branch.id &&
    normalize(e.employeeName) === normalize(employeeName)
  );

  if (duplicate) {
    return json(409, { ok: false, message: "이 지점에 이미 같은 직원명이 있어." });
  }

  const employee = {
    id: crypto.randomUUID(),
    branchId: branch.id,
    employeeName,
    employeeNameKey: normalize(employeeName),
    passwordHash: hashPassword(password),
    role,
    createdAt: now()
  };

  data.employees.push(employee);

  addLog(data, {
    branchId: branch.id,
    employeeId: employee.id,
    branchName: branch.branchName,
    employeeName,
    action: "직원 가입"
  });

  await writeDB(store, data);
  return json(201, { ok: true, message: "직원 가입 완료!" });
}

async function login(event, data, store) {
  const body = await readBody(event);
  const branchName = String(body.branchName || "").trim();
  const employeeName = String(body.employeeName || "").trim();
  const password = String(body.password || "");

  const branch = data.branches.find(b => b.branchName === branchName);
  if (!branch) {
    return json(401, { ok: false, message: "지점명, 직원명 또는 비밀번호가 맞지 않아." });
  }

  const employee = data.employees.find(e =>
    e.branchId === branch.id &&
    normalize(e.employeeName) === normalize(employeeName)
  );

  if (!employee || !verifyPassword(password, employee.passwordHash)) {
    return json(401, { ok: false, message: "지점명, 직원명 또는 비밀번호가 맞지 않아." });
  }

  const token = signToken({
    branchId: branch.id,
    employeeId: employee.id,
    iat: Date.now()
  });

  addLog(data, {
    branchId: branch.id,
    employeeId: employee.id,
    branchName: branch.branchName,
    employeeName: employee.employeeName,
    action: "로그인"
  });

  await writeDB(store, data);

  return json(200, {
    ok: true,
    token,
    user: {
      branchName: branch.branchName,
      employeeName: employee.employeeName,
      role: employee.role
    }
  });
}

async function logout(event, data, store) {
  const session = requireSession(data, event);

  addLog(data, {
    branchId: session.branchId,
    employeeId: session.employeeId,
    branchName: session.branchName,
    employeeName: session.employeeName,
    action: "로그아웃"
  });

  await writeDB(store, data);
  return json(200, { ok: true, message: "로그아웃 완료." });
}

async function me(event, data) {
  const session = requireSession(data, event);
  return json(200, {
    ok: true,
    user: {
      branchName: session.branchName,
      employeeName: session.employeeName,
      role: session.role
    }
  });
}

async function listBranches(data) {
  return json(200, {
    ok: true,
    branches: data.branches
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(b => ({
        branch_name: b.branchName,
        branch_code: b.branchCode
      }))
  });
}

async function dashboard(event, data) {
  const session = requireSession(data, event);
  const customers = data.customers;
  const logs = data.logs.filter(l => l.branchId === session.branchId);
  const today = new Date().toISOString().slice(0, 10);

  return json(200, {
    ok: true,
    stats: {
      totalCustomers: customers.length,
      activeLines: customers.filter(c => c.status === "active").length,
      unpaidCustomers: customers.filter(c => c.unpaid).length,
      todayLogs: logs.filter(l => l.createdAt.slice(0, 10) === today).length
    },
    recentLogs: logs.slice().reverse().slice(0, 5).map(l => ({
      employee_name: l.employeeName,
      action: l.action,
      created_at: l.createdAt
    }))
  });
}

async function listCustomers(event, data) {
  requireSession(data, event);
  const phone = event.queryStringParameters?.phone || "";

  let customers = data.customers;

  if (phone) {
    customers = customers.filter(c => c.phone.includes(phone));
  }

  customers = customers
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(c => {
      const branch = data.branches.find(b => b.id === c.branchId);
      return {
        ...mapCustomer(c),
        branchId: c.branchId,
        branchName: branch?.branchName || "",
        joinType: c.joinType || "",
        usimType: c.usimType || "",
        device: c.device || ""
      };
    });

  return json(200, { ok: true, customers });
}

async function createCustomer(event, data, store) {
  const session = requireSession(data, event);
  const body = await readBody(event);

  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  const plan = String(body.plan || "").trim();

  if (!name || !phone || !planPrices[plan]) {
    return json(400, { ok: false, message: "고객명, 전화번호, 요금제를 확인해줘." });
  }

  const duplicate = data.customers.some(c => c.phone === phone);
  if (duplicate) {
    return json(409, { ok: false, message: "이미 등록된 전화번호야." });
  }

  const customer = {
    id: crypto.randomUUID(),
    branchId: session.branchId,
    name,
    phone,
    plan,
    monthlyFee: planPrices[plan],
    unpaid: false,
    status: "active",
    dataGb: 0,
    callMinutes: 0,
    smsCount: 0,
    createdAt: now()
  };

  data.customers.push(customer);

  addLog(data, {
    branchId: session.branchId,
    employeeId: session.employeeId,
    branchName: session.branchName,
    employeeName: session.employeeName,
    action: `신규 개통: ${name} / ${phone} / ${plan}`
  });

  await writeDB(store, data);
  return json(201, { ok: true, message: "신규 개통 완료." });
}

async function updateCustomer(event, path, data, store) {
  const session = requireSession(data, event);
  const customerId = decodeURIComponent(path.split("/")[2]);
  const body = await readBody(event);
  const customer = data.customers.find(c => c.id === customerId);

  if (!customer) {
    return json(404, { ok: false, message: "고객을 찾을 수 없어." });
  }

  let logText = "";

  if (body.action === "close") {
    customer.status = "closed";
    logText = `회선 해지: ${customer.name} / ${customer.phone}`;
  } else if (body.action === "reopen") {
    customer.status = "active";
    logText = `회선 재개통: ${customer.name} / ${customer.phone}`;
  } else if (body.action === "pay") {
    customer.unpaid = false;
    logText = `요금 납부 처리: ${customer.name} / ${customer.phone}`;
  } else if (body.action === "unpaid") {
    customer.unpaid = true;
    logText = `요금 미납 처리: ${customer.name} / ${customer.phone}`;
  } else if (body.action === "usage") {
    if (body.type === "data") {
      customer.dataGb += 1;
      logText = `사용량 증가: 데이터 +1GB / ${customer.name}`;
    } else if (body.type === "call") {
      customer.callMinutes += 10;
      logText = `사용량 증가: 통화 +10분 / ${customer.name}`;
    } else if (body.type === "sms") {
      customer.smsCount += 5;
      logText = `사용량 증가: 문자 +5건 / ${customer.name}`;
    } else {
      return json(400, { ok: false, message: "사용량 타입이 잘못됐어." });
    }
  } else {
    return json(400, { ok: false, message: "처리할 action이 잘못됐어." });
  }

  addLog(data, {
    branchId: session.branchId,
    employeeId: session.employeeId,
    branchName: session.branchName,
    employeeName: session.employeeName,
    action: logText
  });

  await writeDB(store, data);
  return json(200, { ok: true, message: "처리 완료." });
}

async function listLogs(event, data) {
  const session = requireSession(data, event);

  const logs = data.logs
    .filter(l => l.branchId === session.branchId)
    .slice()
    .reverse()
    .slice(0, 100)
    .map(l => ({
      employee_name: l.employeeName,
      action: l.action,
      created_at: l.createdAt
    }));

  return json(200, { ok: true, logs });
}


async function lineComplete(event, data, store) {
  const session = requireSession(data, event);
  const body = await readBody(event);
  const type = String(body.type || '').trim();
  const name = String(body.name || '').trim();
  const phone = String(body.phone || '').trim();
  const plan = String(body.plan || '').trim();
  const rrn7 = String(body.rrn7 || '').trim();
  const oldCarrier = String(body.oldCarrier || '').trim();
  const usimType = String(body.usimType || '').trim();
  if (!type || !name || !phone || !planPrices[plan]) return json(400, { ok:false, message:'가입 정보가 부족해.' });
  if (rrn7 && !/^\d{7}$/.test(rrn7)) return json(400, { ok:false, message:'주민번호는 앞 7자리만 입력해야 해.' });
  let customer = data.customers.find(c => c.phone === phone);
  if (customer && customer.branchId !== session.branchId) return json(409, { ok:false, message:'다른 지점에 이미 등록된 전화번호야.' });
  if (customer) {
    customer.name=name; customer.plan=plan; customer.monthlyFee=planPrices[plan]; customer.status='active'; customer.unpaid=false;
    customer.joinType=type; customer.oldCarrier=oldCarrier; customer.usimType=usimType || customer.usimType || ''; customer.updatedAt=now();
  } else {
    customer={ id:crypto.randomUUID(), branchId:session.branchId, name, phone, plan, monthlyFee:planPrices[plan], unpaid:false, status:'active', dataGb:0, callMinutes:0, smsCount:0, joinType:type, oldCarrier, usimType, createdAt:now() };
    data.customers.push(customer);
  }
  addLog(data, { branchId:session.branchId, employeeId:session.employeeId, branchName:session.branchName, employeeName:session.employeeName, action:`${type} 완료 및 회선 등록: ${name} / ${phone} / ${plan}${usimType ? ' / '+usimType : ''}` });
  await writeDB(store, data);
  return json(201, { ok:true, message:`${type} 완료 및 회선 등록 완료.`, customer: mapCustomer(customer) });
}

async function deviceChangeComplete(event, data, store) {
  const session = requireSession(data, event);
  const body = await readBody(event);
  const name=String(body.name||'').trim(), phone=String(body.phone||'').trim(), device=String(body.device||'').trim(), plan=String(body.plan||'').trim();
  if (!name || !phone || !device || !plan) return json(400, { ok:false, message:'기기변경 정보가 부족해.' });
  const customer=data.customers.find(c => c.phone===phone && c.branchId===session.branchId);
  if (customer) { customer.name=name; customer.device=device; if (planPrices[plan]) { customer.plan=plan; customer.monthlyFee=planPrices[plan]; } customer.updatedAt=now(); }
  addLog(data, { branchId:session.branchId, employeeId:session.employeeId, branchName:session.branchName, employeeName:session.employeeName, action:`기기변경 완료: ${name} / ${phone} / ${device} / ${plan}` });
  await writeDB(store, data);
  return json(201, { ok:true, message:'기기변경 완료.' });
}


function getBranchCustomers(data, session) {
  // 네버랩텔레콤은 고객/회선을 전 지점 공용으로 조회하도록 변경.
  return data.customers;
}

function findCustomerByPhone(data, session, phone) {
  // 모든 지점에서 같은 고객 전화번호를 조회할 수 있게 함.
  return data.customers.find(c => c.phone === phone);
}

function requireManager(session) {
  if (session.role !== "manager") {
    const err = new Error("매니저 권한이 필요해.");
    err.statusCode = 403;
    throw err;
  }
}

async function customerDetail(event, path, data, store) {
  const session = requireSession(data, event);
  const customerId = decodeURIComponent(path.split("/")[2]);
  const customer = data.customers.find(c => c.id === customerId);

  if (!customer) return json(404, { ok: false, message: "고객을 찾을 수 없어." });

  const consultations = data.consultations
    .filter(x => x.customerId === customer.id)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const tickets = data.tickets
    .filter(x => x.customerId === customer.id)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const bills = data.bills
    .filter(x => x.customerId === customer.id)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const apps = data.applications
    .filter(x => x.customerId === customer.id || x.phone === customer.phone)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  data.auditLogs.push({
    id: crypto.randomUUID(),
    branchId: session.branchId,
    employeeId: session.employeeId,
    employeeName: session.employeeName,
    action: "고객 상세 조회",
    customerId: customer.id,
    customerName: customer.name,
    phone: customer.phone,
    createdAt: now()
  });
  await writeDB(store, data);

  return json(200, {
    ok: true,
    customer: mapCustomer(customer),
    rawCustomer: customer,
    consultations,
    tickets,
    bills,
    applications: apps
  });
}

async function createConsultation(event, data, store) {
  const session = requireSession(data, event);
  const body = await readBody(event);

  const phone = String(body.phone || "").trim();
  const category = String(body.category || "일반상담").trim();
  const memo = String(body.memo || "").trim();
  const nextContactAt = String(body.nextContactAt || "").trim();

  const customer = findCustomerByPhone(data, session, phone);
  if (!customer) return json(404, { ok: false, message: "고객 전화번호를 찾을 수 없어." });
  if (!memo) return json(400, { ok: false, message: "상담 내용을 입력해줘." });

  const item = {
    id: crypto.randomUUID(),
    branchId: session.branchId,
    employeeId: session.employeeId,
    employeeName: session.employeeName,
    customerId: customer.id,
    customerName: customer.name,
    phone,
    category,
    memo,
    nextContactAt,
    status: "완료",
    createdAt: now()
  };

  data.consultations.push(item);
  addLog(data, {
    branchId: session.branchId,
    employeeId: session.employeeId,
    branchName: session.branchName,
    employeeName: session.employeeName,
    action: `상담 이력 등록: ${customer.name} / ${phone} / ${category}`
  });

  await writeDB(store, data);
  return json(201, { ok: true, consultation: item });
}

async function listConsultations(event, data) {
  const session = requireSession(data, event);
  const items = data.consultations
    .filter(x => x.branchId === session.branchId)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 200);

  return json(200, { ok: true, consultations: items });
}

async function createTicket(event, data, store) {
  const session = requireSession(data, event);
  const body = await readBody(event);

  const phone = String(body.phone || "").trim();
  const type = String(body.type || "일반민원").trim();
  const priority = String(body.priority || "보통").trim();
  const memo = String(body.memo || "").trim();

  const customer = findCustomerByPhone(data, session, phone);
  if (!customer) return json(404, { ok: false, message: "고객 전화번호를 찾을 수 없어." });
  if (!memo) return json(400, { ok: false, message: "장애/민원 내용을 입력해줘." });

  const item = {
    id: crypto.randomUUID(),
    branchId: session.branchId,
    employeeId: session.employeeId,
    employeeName: session.employeeName,
    customerId: customer.id,
    customerName: customer.name,
    phone,
    type,
    priority,
    memo,
    status: "접수",
    createdAt: now(),
    updatedAt: now()
  };

  data.tickets.push(item);
  addLog(data, {
    branchId: session.branchId,
    employeeId: session.employeeId,
    branchName: session.branchName,
    employeeName: session.employeeName,
    action: `장애/민원 접수: ${customer.name} / ${phone} / ${type}`
  });

  await writeDB(store, data);
  return json(201, { ok: true, ticket: item });
}

async function listTickets(event, data) {
  const session = requireSession(data, event);
  const tickets = data.tickets
    .filter(x => x.branchId === session.branchId)
    .slice()
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return json(200, { ok: true, tickets });
}

async function updateTicket(event, path, data, store) {
  const session = requireSession(data, event);
  const id = decodeURIComponent(path.split("/")[2]);
  const body = await readBody(event);
  const ticket = data.tickets.find(x => x.id === id && x.branchId === session.branchId);
  if (!ticket) return json(404, { ok: false, message: "티켓을 찾을 수 없어." });

  ticket.status = String(body.status || ticket.status);
  ticket.updatedAt = now();

  addLog(data, {
    branchId: session.branchId,
    employeeId: session.employeeId,
    branchName: session.branchName,
    employeeName: session.employeeName,
    action: `티켓 상태 변경: ${ticket.customerName} / ${ticket.status}`
  });

  await writeDB(store, data);
  return json(200, { ok: true, ticket });
}

async function listApplications(event, data) {
  const session = requireSession(data, event);
  const applications = data.applications
    .filter(x => x.branchId === session.branchId)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return json(200, { ok: true, applications });
}

async function updateApplication(event, path, data, store) {
  const session = requireSession(data, event);
  const id = decodeURIComponent(path.split("/")[2]);
  const body = await readBody(event);
  const app = data.applications.find(x => x.id === id && x.branchId === session.branchId);
  if (!app) return json(404, { ok: false, message: "신청 건을 찾을 수 없어." });

  app.status = String(body.status || app.status);
  app.updatedAt = now();

  addLog(data, {
    branchId: session.branchId,
    employeeId: session.employeeId,
    branchName: session.branchName,
    employeeName: session.employeeName,
    action: `신청 상태 변경: ${app.type} / ${app.name} / ${app.status}`
  });

  await writeDB(store, data);
  return json(200, { ok: true, application: app });
}

async function generateBills(event, data, store) {
  const session = requireSession(data, event);
  const body = await readBody(event);
  const billingMonth = String(body.billingMonth || new Date().toISOString().slice(0, 7));

  const customers = getBranchCustomers(data, session).filter(c => c.status === "active");
  let created = 0;

  for (const c of customers) {
    const exists = data.bills.some(b => b.customerId === c.id && b.billingMonth === billingMonth);
    if (exists) continue;

    data.bills.push({
      id: crypto.randomUUID(),
      branchId: session.branchId,
      customerId: c.id,
      customerName: c.name,
      phone: c.phone,
      plan: c.plan,
      billingMonth,
      amount: c.monthlyFee || 0,
      status: "미납",
      createdAt: now(),
      paidAt: ""
    });
    c.unpaid = true;
    created++;
  }

  addLog(data, {
    branchId: session.branchId,
    employeeId: session.employeeId,
    branchName: session.branchName,
    employeeName: session.employeeName,
    action: `월 청구 생성: ${billingMonth} / ${created}건`
  });

  await writeDB(store, data);
  return json(201, { ok: true, message: `${created}건 청구서를 생성했어.`, created });
}

async function listBills(event, data) {
  const session = requireSession(data, event);
  const bills = data.bills
    .filter(x => x.branchId === session.branchId)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return json(200, { ok: true, bills });
}

async function updateBill(event, path, data, store) {
  const session = requireSession(data, event);
  const id = decodeURIComponent(path.split("/")[2]);
  const bill = data.bills.find(x => x.id === id && x.branchId === session.branchId);
  if (!bill) return json(404, { ok: false, message: "청구서를 찾을 수 없어." });

  bill.status = "납부완료";
  bill.paidAt = now();

  const customer = data.customers.find(c => c.id === bill.customerId);
  if (customer) {
    const unpaidLeft = data.bills.some(b => b.customerId === customer.id && b.status !== "납부완료" && b.id !== bill.id);
    customer.unpaid = unpaidLeft;
  }

  addLog(data, {
    branchId: session.branchId,
    employeeId: session.employeeId,
    branchName: session.branchName,
    employeeName: session.employeeName,
    action: `청구서 납부 처리: ${bill.customerName} / ${bill.billingMonth} / ${bill.amount}원`
  });

  await writeDB(store, data);
  return json(200, { ok: true, bill });
}

async function planChange(event, data, store) {
  const session = requireSession(data, event);
  const body = await readBody(event);
  const phone = String(body.phone || "").trim();
  const newPlan = String(body.newPlan || "").trim();
  const mode = String(body.mode || "즉시 변경").trim();

  const customer = findCustomerByPhone(data, session, phone);
  if (!customer) return json(404, { ok: false, message: "고객 전화번호를 찾을 수 없어." });
  if (!planPrices[newPlan]) return json(400, { ok: false, message: "요금제를 확인해줘." });

  const oldPlan = customer.plan;
  customer.plan = newPlan;
  customer.monthlyFee = planPrices[newPlan];

  data.serviceOrders.push({
    id: crypto.randomUUID(),
    branchId: session.branchId,
    customerId: customer.id,
    type: "요금제 변경",
    oldValue: oldPlan,
    newValue: newPlan,
    status: mode,
    createdAt: now()
  });

  addLog(data, {
    branchId: session.branchId,
    employeeId: session.employeeId,
    branchName: session.branchName,
    employeeName: session.employeeName,
    action: `요금제 변경: ${customer.name} / ${oldPlan} → ${newPlan}`
  });

  await writeDB(store, data);
  return json(200, { ok: true, customer: mapCustomer(customer) });
}

async function addonChange(event, data, store) {
  const session = requireSession(data, event);
  const body = await readBody(event);
  const phone = String(body.phone || "").trim();
  const addon = String(body.addon || "").trim();
  const action = String(body.action || "가입").trim();

  const customer = findCustomerByPhone(data, session, phone);
  if (!customer) return json(404, { ok: false, message: "고객 전화번호를 찾을 수 없어." });

  customer.addons ||= [];
  if (action === "가입" && !customer.addons.includes(addon)) customer.addons.push(addon);
  if (action === "해지") customer.addons = customer.addons.filter(x => x !== addon);

  data.serviceOrders.push({
    id: crypto.randomUUID(),
    branchId: session.branchId,
    customerId: customer.id,
    type: "부가서비스",
    oldValue: addon,
    newValue: action,
    status: "완료",
    createdAt: now()
  });

  addLog(data, {
    branchId: session.branchId,
    employeeId: session.employeeId,
    branchName: session.branchName,
    employeeName: session.employeeName,
    action: `부가서비스 ${action}: ${customer.name} / ${addon}`
  });

  await writeDB(store, data);
  return json(200, { ok: true, customer });
}

async function usimReissue(event, data, store) {
  const session = requireSession(data, event);
  const body = await readBody(event);
  const phone = String(body.phone || "").trim();
  const simType = String(body.simType || "USIM").trim();
  const reason = String(body.reason || "분실/파손").trim();

  const customer = findCustomerByPhone(data, session, phone);
  if (!customer) return json(404, { ok: false, message: "고객 전화번호를 찾을 수 없어." });

  customer.usimType = simType;
  customer.usimReissuedAt = now();

  data.serviceOrders.push({
    id: crypto.randomUUID(),
    branchId: session.branchId,
    customerId: customer.id,
    type: "USIM/eSIM 재발급",
    oldValue: reason,
    newValue: simType,
    status: "완료",
    createdAt: now()
  });

  addLog(data, {
    branchId: session.branchId,
    employeeId: session.employeeId,
    branchName: session.branchName,
    employeeName: session.employeeName,
    action: `${simType} 재발급: ${customer.name} / ${phone} / ${reason}`
  });

  await writeDB(store, data);
  return json(200, { ok: true, customer });
}

async function listEmployees(event, data) {
  const session = requireSession(data, event);
  requireManager(session);

  const employees = data.employees
    .filter(e => e.branchId === session.branchId)
    .map(e => ({
      id: e.id,
      employeeName: e.employeeName,
      role: e.role,
      createdAt: e.createdAt
    }));

  return json(200, { ok: true, employees });
}

async function updateEmployeeRole(event, path, data, store) {
  const session = requireSession(data, event);
  requireManager(session);

  const id = decodeURIComponent(path.split("/")[2]);
  const body = await readBody(event);
  const role = body.role === "manager" ? "manager" : "staff";

  const employee = data.employees.find(e => e.id === id && e.branchId === session.branchId);
  if (!employee) return json(404, { ok: false, message: "직원을 찾을 수 없어." });

  employee.role = role;

  addLog(data, {
    branchId: session.branchId,
    employeeId: session.employeeId,
    branchName: session.branchName,
    employeeName: session.employeeName,
    action: `직원 권한 변경: ${employee.employeeName} → ${role}`
  });

  await writeDB(store, data);
  return json(200, { ok: true, employee: { id: employee.id, employeeName: employee.employeeName, role } });
}

async function branchPerformance(event, data) {
  const session = requireSession(data, event);
  const today = new Date().toISOString().slice(0, 10);
  const apps = data.applications.filter(a => a.branchId === session.branchId);
  const logs = data.logs.filter(l => l.branchId === session.branchId);
  const tickets = data.tickets.filter(t => t.branchId === session.branchId);
  const bills = data.bills.filter(b => b.branchId === session.branchId);

  const byEmployee = {};
  for (const l of logs) {
    byEmployee[l.employeeName] ||= { employeeName: l.employeeName, logs: 0, joins: 0, tickets: 0 };
    byEmployee[l.employeeName].logs++;
    if (l.action.includes("가입") || l.action.includes("번호이동") || l.action.includes("기기변경")) byEmployee[l.employeeName].joins++;
    if (l.action.includes("민원") || l.action.includes("티켓")) byEmployee[l.employeeName].tickets++;
  }

  return json(200, {
    ok: true,
    performance: {
      todayApplications: apps.filter(a => a.createdAt.slice(0, 10) === today).length,
      totalApplications: apps.length,
      openTickets: tickets.filter(t => t.status !== "완료").length,
      unpaidBills: bills.filter(b => b.status !== "납부완료").length,
      paidAmount: bills.filter(b => b.status === "납부완료").reduce((sum, b) => sum + Number(b.amount || 0), 0),
      employees: Object.values(byEmployee)
    }
  });
}


async function listCatalogPlans(event, data) {
  requireSession(data, event);
  return json(200, { ok: true, plans: data.catalogPlans });
}

async function upsertCatalogPlan(event, data, store) {
  const session = requireSession(data, event);
  requireManager(session);
  const body = await readBody(event);
  const name = String(body.name || "").trim();
  const price = Number(body.price || 0);
  const category = String(body.category || "기타").trim();
  const benefits = Array.isArray(body.benefits) ? body.benefits : String(body.benefits || "").split(",").map(x => x.trim()).filter(Boolean);
  if (!name || !price) return json(400, { ok:false, message:"요금제명과 가격을 입력해줘." });

  let plan = data.catalogPlans.find(p => p.name === name);
  if (plan) {
    plan.price = price; plan.category = category; plan.benefits = benefits; plan.hasBenefits = benefits.length > 0; plan.active = body.active !== false;
  } else {
    plan = { name, price, category, benefits, hasBenefits: benefits.length > 0, active: true, sourceNote: "관리자 추가" };
    data.catalogPlans.push(plan);
  }
  addLog(data, { branchId:session.branchId, employeeId:session.employeeId, branchName:session.branchName, employeeName:session.employeeName, action:`요금제/상품 카탈로그 저장: ${name}` });
  await writeDB(store, data);
  return json(200, { ok:true, plan });
}

async function toggleCatalogPlan(event, path, data, store) {
  const session = requireSession(data, event);
  requireManager(session);
  const name = decodeURIComponent(path.split("/").pop());
  const body = await readBody(event);
  const plan = data.catalogPlans.find(p => p.name === name);
  if (!plan) return json(404, { ok:false, message:"요금제를 찾을 수 없어." });
  if (typeof body.active === "boolean") plan.active = body.active;
  if (Array.isArray(body.benefits)) { plan.benefits = body.benefits; plan.hasBenefits = body.benefits.length > 0; }
  await writeDB(store, data);
  return json(200, { ok:true, plan });
}

async function listInventory(event, data) {
  const session = requireSession(data, event);
  return json(200, { ok:true, inventory: data.inventory.filter(x => !x.branchId || x.branchId === session.branchId) });
}

async function addInventory(event, data, store) {
  const session = requireSession(data, event);
  const body = await readBody(event);
  const item = { id:crypto.randomUUID(), branchId:session.branchId, type:String(body.type||"단말기"), name:String(body.name||"").trim(), model:String(body.model||"").trim(), stock:Number(body.stock||0), status:String(body.status||"사용가능"), createdAt:now() };
  if (!item.name) return json(400, { ok:false, message:"재고명을 입력해줘." });
  data.inventory.push(item);
  addLog(data, { branchId:session.branchId, employeeId:session.employeeId, branchName:session.branchName, employeeName:session.employeeName, action:`재고 추가: ${item.name} / ${item.stock}` });
  await writeDB(store, data);
  return json(201, { ok:true, item });
}

async function updateInventory(event, path, data, store) {
  const session = requireSession(data, event);
  const id = decodeURIComponent(path.split("/").pop());
  const body = await readBody(event);
  const item = data.inventory.find(x => x.id === id);
  if (!item) return json(404, { ok:false, message:"재고를 찾을 수 없어." });
  if (body.stock !== undefined) item.stock = Number(body.stock);
  if (body.status) item.status = String(body.status);
  item.updatedAt = now();
  addLog(data, { branchId:session.branchId, employeeId:session.employeeId, branchName:session.branchName, employeeName:session.employeeName, action:`재고 수정: ${item.name} / ${item.stock}` });
  await writeDB(store, data);
  return json(200, { ok:true, item });
}

async function listMobileTracking(event, data) {
  const session = requireSession(data, event);
  return json(200, { ok:true, tracking: data.mobileTracking.filter(x => x.branchId === session.branchId).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)) });
}

async function createMobileTracking(event, data, store) {
  const session = requireSession(data, event);
  const body = await readBody(event);
  const item = { id:crypto.randomUUID(), branchId:session.branchId, name:String(body.name||"").trim(), phone:String(body.phone||"").trim(), oldCarrier:String(body.oldCarrier||"").trim(), plan:String(body.plan||"").trim(), status:"접수", createdAt:now(), updatedAt:now() };
  if (!item.name || !item.phone) return json(400, { ok:false, message:"이름과 전화번호를 입력해줘." });
  data.mobileTracking.push(item);
  addLog(data, { branchId:session.branchId, employeeId:session.employeeId, branchName:session.branchName, employeeName:session.employeeName, action:`번호이동 추적 접수: ${item.name} / ${item.phone}` });
  await writeDB(store, data);
  return json(201, { ok:true, item });
}

async function updateMobileTracking(event, path, data, store) {
  const session = requireSession(data, event);
  const id = decodeURIComponent(path.split("/").pop());
  const body = await readBody(event);
  const item = data.mobileTracking.find(x => x.id === id && x.branchId === session.branchId);
  if (!item) return json(404, { ok:false, message:"번호이동 건을 찾을 수 없어." });
  item.status = String(body.status || item.status);
  item.updatedAt = now();
  addLog(data, { branchId:session.branchId, employeeId:session.employeeId, branchName:session.branchName, employeeName:session.employeeName, action:`번호이동 상태 변경: ${item.name} / ${item.status}` });
  await writeDB(store, data);
  return json(200, { ok:true, item });
}

async function listNotifications(event, data) {
  const session = requireSession(data, event);
  return json(200, { ok:true, notifications: data.notifications.filter(x => x.branchId === session.branchId).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,200) });
}

async function sendNotification(event, data, store) {
  const session = requireSession(data, event);
  const body = await readBody(event);
  const item = { id:crypto.randomUUID(), branchId:session.branchId, employeeId:session.employeeId, employeeName:session.employeeName, channel:String(body.channel||"SMS"), phone:String(body.phone||"").trim(), template:String(body.template||"직접입력"), message:String(body.message||"").trim(), status:"발송완료(시뮬레이션)", createdAt:now() };
  if (!item.phone || !item.message) return json(400, { ok:false, message:"전화번호와 내용을 입력해줘." });
  data.notifications.push(item);
  addLog(data, { branchId:session.branchId, employeeId:session.employeeId, branchName:session.branchName, employeeName:session.employeeName, action:`알림 발송 시뮬레이션: ${item.channel} / ${item.phone}` });
  await writeDB(store, data);
  return json(201, { ok:true, item });
}

async function listKnowledge(event, data) {
  requireSession(data, event);
  return json(200, { ok:true, knowledge: data.knowledgeBase.sort((a,b)=>a.category.localeCompare(b.category)) });
}

async function addKnowledge(event, data, store) {
  const session = requireSession(data, event);
  const body = await readBody(event);
  const item = { id:crypto.randomUUID(), category:String(body.category||"일반"), title:String(body.title||"").trim(), content:String(body.content||"").trim(), createdAt:now() };
  if (!item.title || !item.content) return json(400, { ok:false, message:"제목과 내용을 입력해줘." });
  data.knowledgeBase.push(item);
  addLog(data, { branchId:session.branchId, employeeId:session.employeeId, branchName:session.branchName, employeeName:session.employeeName, action:`지식베이스 추가: ${item.title}` });
  await writeDB(store, data);
  return json(201, { ok:true, item });
}

async function changeCustomerBenefit(event, data, store) {
  const session = requireSession(data, event);
  const body = await readBody(event);
  const phone = String(body.phone || "").trim();
  const benefit = String(body.benefit || "").trim();
  const customer = findCustomerByPhone(data, session, phone);
  if (!customer) return json(404, { ok:false, message:"고객을 찾을 수 없어." });
  const plan = data.catalogPlans.find(p => p.name === customer.plan);
  if (!plan || !plan.benefits || !plan.benefits.length) return json(400, { ok:false, message:"이 고객의 현재 요금제에는 변경 가능한 혜택이 없어." });
  if (!plan.benefits.includes(benefit)) return json(400, { ok:false, message:"해당 요금제의 혜택이 아니야." });
  customer.selectedBenefit = benefit;
  customer.updatedAt = now();
  addLog(data, { branchId:session.branchId, employeeId:session.employeeId, branchName:session.branchName, employeeName:session.employeeName, action:`고객 혜택 변경: ${customer.name} / ${customer.plan} / ${benefit}` });
  await writeDB(store, data);
  return json(200, { ok:true, customer });
}


function customerBranchName(data, customer) {
  const branch = data.branches.find(b => b.id === customer.branchId);
  return branch?.branchName || "";
}

async function advancedCustomerSearch(event, data) {
  requireSession(data, event);
  const q = event.queryStringParameters || {};
  const keyword = String(q.keyword || "").trim().toLowerCase();
  const status = String(q.status || "").trim();
  const unpaid = String(q.unpaid || "").trim();
  const plan = String(q.plan || "").trim().toLowerCase();
  const branchName = String(q.branchName || "").trim().toLowerCase();

  let customers = data.customers.slice();

  if (keyword) {
    customers = customers.filter(c =>
      String(c.name || "").toLowerCase().includes(keyword) ||
      String(c.phone || "").toLowerCase().includes(keyword) ||
      String(c.plan || "").toLowerCase().includes(keyword) ||
      String(c.device || "").toLowerCase().includes(keyword) ||
      customerBranchName(data, c).toLowerCase().includes(keyword)
    );
  }
  if (status) customers = customers.filter(c => c.status === status);
  if (unpaid === "true") customers = customers.filter(c => c.unpaid === true);
  if (unpaid === "false") customers = customers.filter(c => c.unpaid !== true);
  if (plan) customers = customers.filter(c => String(c.plan || "").toLowerCase().includes(plan));
  if (branchName) customers = customers.filter(c => customerBranchName(data, c).toLowerCase().includes(branchName));

  return json(200, {
    ok: true,
    customers: customers
      .sort((a,b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
      .map(c => ({
        ...mapCustomer(c),
        branchName: customerBranchName(data, c),
        lineStatus: c.status || "active",
        device: c.device || "",
        selectedBenefit: c.selectedBenefit || "",
        installment: c.installment || null
      }))
  });
}

async function updateLineStatus(event, data, store) {
  const session = requireSession(data, event);
  const body = await readBody(event);
  const phone = String(body.phone || "").trim();
  const status = String(body.status || "").trim();
  const reason = String(body.reason || "").trim();

  const allowed = ["active", "temporary_stop", "lost_stop", "military_stop", "unpaid_stop", "closed"];
  if (!allowed.includes(status)) return json(400, { ok:false, message:"회선 상태가 잘못됐어." });

  const customer = data.customers.find(c => c.phone === phone);
  if (!customer) return json(404, { ok:false, message:"고객을 찾을 수 없어." });

  const oldStatus = customer.status;
  customer.status = status;
  customer.lineStopReason = reason;
  customer.updatedAt = now();

  data.workQueue.push({
    id: crypto.randomUUID(),
    branchId: session.branchId,
    employeeId: session.employeeId,
    employeeName: session.employeeName,
    type: "회선상태 변경",
    targetName: customer.name,
    phone: customer.phone,
    status: "처리완료",
    reason: `${oldStatus} → ${status} / ${reason}`,
    createdAt: now(),
    updatedAt: now()
  });

  addLog(data, {
    branchId: session.branchId,
    employeeId: session.employeeId,
    branchName: session.branchName,
    employeeName: session.employeeName,
    action: `회선 상태 변경: ${customer.name} / ${phone} / ${oldStatus} → ${status}`
  });

  await writeDB(store, data);
  return json(200, { ok:true, customer: mapCustomer(customer) });
}

async function penaltyCalc(event, data) {
  requireSession(data, event);
  const body = await readBody(event);
  const contractMonths = Number(body.contractMonths || 24);
  const usedMonths = Number(body.usedMonths || 0);
  const monthlyDiscount = Number(body.monthlyDiscount || 25000);
  const deviceSupport = Number(body.deviceSupport || 0);
  const remainingMonths = Math.max(contractMonths - usedMonths, 0);

  // 시뮬레이터용 단순 계산식: 남은 선택약정 할인 반환 예상 + 남은 공시지원금 비례분
  const discountPenalty = remainingMonths * monthlyDiscount;
  const devicePenalty = contractMonths ? Math.round(deviceSupport * (remainingMonths / contractMonths)) : 0;
  const totalPenalty = discountPenalty + devicePenalty;

  return json(200, {
    ok: true,
    result: {
      contractMonths,
      usedMonths,
      remainingMonths,
      monthlyDiscount,
      deviceSupport,
      discountPenalty,
      devicePenalty,
      totalPenalty
    }
  });
}

async function setInstallment(event, data, store) {
  const session = requireSession(data, event);
  const body = await readBody(event);
  const phone = String(body.phone || "").trim();
  const deviceName = String(body.deviceName || "").trim();
  const devicePrice = Number(body.devicePrice || 0);
  const months = Number(body.months || 24);
  const paidMonths = Number(body.paidMonths || 0);

  const customer = data.customers.find(c => c.phone === phone);
  if (!customer) return json(404, { ok:false, message:"고객을 찾을 수 없어." });
  if (!devicePrice || !months) return json(400, { ok:false, message:"출고가와 할부개월을 입력해줘." });

  const monthly = Math.round(devicePrice / months);
  const remainingMonths = Math.max(months - paidMonths, 0);
  const remainingAmount = monthly * remainingMonths;

  customer.device = deviceName || customer.device || "단말기";
  customer.installment = {
    deviceName: customer.device,
    devicePrice,
    months,
    paidMonths,
    monthly,
    remainingMonths,
    remainingAmount,
    updatedAt: now()
  };

  addLog(data, {
    branchId: session.branchId,
    employeeId: session.employeeId,
    branchName: session.branchName,
    employeeName: session.employeeName,
    action: `단말기 할부 등록/수정: ${customer.name} / ${customer.device} / 월 ${monthly}원`
  });

  await writeDB(store, data);
  return json(200, { ok:true, customer });
}

async function listWorkQueue(event, data) {
  requireSession(data, event);
  return json(200, {
    ok:true,
    workQueue: data.workQueue
      .slice()
      .sort((a,b) => String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || "")))
      .slice(0, 300)
  });
}

async function createWorkQueue(event, data, store) {
  const session = requireSession(data, event);
  const body = await readBody(event);
  const item = {
    id: crypto.randomUUID(),
    branchId: session.branchId,
    employeeId: session.employeeId,
    employeeName: session.employeeName,
    type: String(body.type || "일반작업"),
    targetName: String(body.targetName || "").trim(),
    phone: String(body.phone || "").trim(),
    status: String(body.status || "접수"),
    reason: String(body.reason || ""),
    createdAt: now(),
    updatedAt: now()
  };
  data.workQueue.push(item);
  addLog(data, { branchId:session.branchId, employeeId:session.employeeId, branchName:session.branchName, employeeName:session.employeeName, action:`작업큐 등록: ${item.type} / ${item.targetName}` });
  await writeDB(store, data);
  return json(201, { ok:true, item });
}

async function updateWorkQueue(event, path, data, store) {
  const session = requireSession(data, event);
  const id = decodeURIComponent(path.split("/").pop());
  const body = await readBody(event);
  const item = data.workQueue.find(x => x.id === id);
  if (!item) return json(404, { ok:false, message:"작업을 찾을 수 없어." });

  item.status = String(body.status || item.status);
  item.reason = String(body.reason || item.reason || "");
  item.updatedAt = now();

  addLog(data, { branchId:session.branchId, employeeId:session.employeeId, branchName:session.branchName, employeeName:session.employeeName, action:`작업 상태 변경: ${item.type} / ${item.status}` });
  await writeDB(store, data);
  return json(200, { ok:true, item });
}

async function listCallbacks(event, data) {
  const session = requireSession(data, event);
  const today = new Date().toISOString().slice(0,10);
  return json(200, {
    ok:true,
    callbacks: data.callbacks
      .filter(x => !x.branchId || x.branchId === session.branchId || true)
      .sort((a,b) => String(a.callbackAt || "").localeCompare(String(b.callbackAt || ""))),
    today
  });
}

async function createCallback(event, data, store) {
  const session = requireSession(data, event);
  const body = await readBody(event);
  const item = {
    id: crypto.randomUUID(),
    branchId: session.branchId,
    employeeId: session.employeeId,
    employeeName: session.employeeName,
    customerName: String(body.customerName || "").trim(),
    phone: String(body.phone || "").trim(),
    callbackAt: String(body.callbackAt || "").trim(),
    memo: String(body.memo || "").trim(),
    status: "예정",
    createdAt: now(),
    updatedAt: now()
  };
  if (!item.customerName || !item.phone || !item.callbackAt) return json(400, { ok:false, message:"이름, 전화번호, 콜백 시간을 입력해줘." });
  data.callbacks.push(item);
  addLog(data, { branchId:session.branchId, employeeId:session.employeeId, branchName:session.branchName, employeeName:session.employeeName, action:`콜백 예약: ${item.customerName} / ${item.callbackAt}` });
  await writeDB(store, data);
  return json(201, { ok:true, item });
}

async function updateCallback(event, path, data, store) {
  const session = requireSession(data, event);
  const id = decodeURIComponent(path.split("/").pop());
  const body = await readBody(event);
  const item = data.callbacks.find(x => x.id === id);
  if (!item) return json(404, { ok:false, message:"콜백을 찾을 수 없어." });
  item.status = String(body.status || item.status);
  item.updatedAt = now();
  addLog(data, { branchId:session.branchId, employeeId:session.employeeId, branchName:session.branchName, employeeName:session.employeeName, action:`콜백 상태 변경: ${item.customerName} / ${item.status}` });
  await writeDB(store, data);
  return json(200, { ok:true, item });
}

async function listAuditLogs(event, data) {
  const session = requireSession(data, event);
  requireManager(session);
  return json(200, {
    ok:true,
    auditLogs: data.auditLogs
      .slice()
      .sort((a,b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
      .slice(0, 500)
  });
}

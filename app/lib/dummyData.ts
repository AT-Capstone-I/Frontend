// 테스트용 더미 데이터
// 실제 API 연동 후 삭제 예정

export interface DummyPlace {
  id: string;
  name: string;
  checked: boolean;
  location: {
    lat: number;
    lng: number;
  };
}

export interface DummyDayData {
  day: number;
  places: DummyPlace[];
}

export interface DummyScheduleData {
  id: string;
  title: string;
  subtitle: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  days: DummyDayData[];
}

// 대전 여행 더미 데이터 (실제 좌표)
export const DUMMY_SCHEDULE_DATA: DummyScheduleData = {
  id: "dummy-trip-001",
  title: "대전",
  subtitle: "도심 속 자연과 과학이 어우러진 여행",
  startDate: "2025.11.12",
  endDate: "11.15",
  totalDays: 2,
  days: [
    {
      day: 1,
      places: [
        {
          id: "place-1",
          name: "대전역",
          checked: true,
          location: {
            lat: 36.3326,
            lng: 127.4346,
          },
        },
        {
          id: "place-2",
          name: "성심당 본점",
          checked: true,
          location: {
            lat: 36.3276,
            lng: 127.4271,
          },
        },
        {
          id: "place-3",
          name: "한밭수목원",
          checked: false,
          location: {
            lat: 36.3686,
            lng: 127.3878,
          },
        },
        {
          id: "place-4",
          name: "국립중앙과학관",
          checked: false,
          location: {
            lat: 36.3742,
            lng: 127.3747,
          },
        },
      ],
    },
    {
      day: 2,
      places: [
        {
          id: "place-5",
          name: "대청호 자연생태관",
          checked: false,
          location: {
            lat: 36.4771,
            lng: 127.4883,
          },
        },
        {
          id: "place-6",
          name: "계족산 황톳길",
          checked: false,
          location: {
            lat: 36.4167,
            lng: 127.4333,
          },
        },
        {
          id: "place-7",
          name: "대전 엑스포 과학공원",
          checked: false,
          location: {
            lat: 36.3743,
            lng: 127.3912,
          },
        },
      ],
    },
  ],
};

// 서울 여행 더미 데이터 (테스트용)
export const DUMMY_SEOUL_DATA: DummyScheduleData = {
  id: "dummy-trip-002",
  title: "서울",
  subtitle: "전통과 현대가 공존하는 도시 여행",
  startDate: "2025.12.01",
  endDate: "12.03",
  totalDays: 2,
  days: [
    {
      day: 1,
      places: [
        {
          id: "seoul-1",
          name: "경복궁",
          checked: false,
          location: {
            lat: 37.5796,
            lng: 126.977,
          },
        },
        {
          id: "seoul-2",
          name: "북촌한옥마을",
          checked: false,
          location: {
            lat: 37.5826,
            lng: 126.9831,
          },
        },
        {
          id: "seoul-3",
          name: "인사동",
          checked: false,
          location: {
            lat: 37.5743,
            lng: 126.9856,
          },
        },
        {
          id: "seoul-4",
          name: "명동",
          checked: false,
          location: {
            lat: 37.5636,
            lng: 126.9869,
          },
        },
      ],
    },
    {
      day: 2,
      places: [
        {
          id: "seoul-5",
          name: "남산타워",
          checked: false,
          location: {
            lat: 37.5512,
            lng: 126.9882,
          },
        },
        {
          id: "seoul-6",
          name: "이태원",
          checked: false,
          location: {
            lat: 37.534,
            lng: 126.9948,
          },
        },
        {
          id: "seoul-7",
          name: "한강공원 여의도",
          checked: false,
          location: {
            lat: 37.5283,
            lng: 126.9345,
          },
        },
      ],
    },
  ],
};

import React, { useState } from "react";
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import CardItem from "./CardItem.component";
import { gql, useQuery } from "@apollo/client";

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

const CardSlider = () => {
  // 쿼리
  const GET_CONTENT_ALL = gql`
    query getContentAll {
      getContentAll {
        id
        title
        desc
        type
      }
    }
  `;
  const [contents, setContents] = useState([] as any);

  const { loading } = useQuery(GET_CONTENT_ALL, {
    onCompleted: (data) => {
      setContents([...data.getContentAll]);
    },
  });

  return (
    <Swiper
      className="swiper-container mh-100 min-vh-83"
      // spaceBetween={10}
      // slidesPerView={6}
      // slidesPerColumn={2}
      // slidesPerColumnFill={"row"}
      breakpoints={{
        0: {
          slidesPerView: 1,
          slidesPerColumn: 2,
          slidesPerColumnFill: "row",
        },
        576: {
          slidesPerView: 2,
          slidesPerColumn: 2,
          slidesPerColumnFill: "row",
        },
        768: {
          slidesPerView: 3,
          slidesPerColumn: 2,
          slidesPerColumnFill: "row",
        },
        992: {
          slidesPerView: 4,
          slidesPerColumn: 2,
          slidesPerColumnFill: "row",
        },
        1200: {
          slidesPerView: 5,
          slidesPerColumn: 2,
          slidesPerColumnFill: "row",
        },
        1500: {
          slidesPerView: 6,
          slidesPerColumn: 2,
          slidesPerColumnFill: "row",
        },
      }}
      navigation
      // pagination={{
      //   clickable: true,
      //   type: "fraction",
      // }}
      scrollbar={{ draggable: true }}
      onSwiper={(swiper) => console.log(swiper)}
      onSlideChange={() => console.log("slide change")}
    >
      {contents.map((el: any) => {
        return (
          <SwiperSlide key={el.id}>
            <CardItem d={el} />
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
};

export default CardSlider;

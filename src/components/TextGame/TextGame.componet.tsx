import React, { useState } from "react";
import { gql, useQuery, useMutation, useReactiveVar } from "@apollo/client";
import { isLoginVar } from "../../common/graphql/client";
import { LinkContainer } from "react-router-bootstrap";
import { Container, Card, CardDeck, Button } from "react-bootstrap";
import { useLocation, useHistory } from "react-router-dom";
import Loading from "../Loading/Loading";
import {
  ShareFill,
  Heart,
  HeartFill,
  Trophy,
  Pen,
  Trash,
} from "react-bootstrap-icons";
import jwt from "jsonwebtoken";
import SweetAlert from "react-bootstrap-sweetalert";
import { Fade } from "react-awesome-reveal";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import { AwesomeButton } from "react-awesome-button";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import { CopyToClipboard } from "react-copy-to-clipboard";

const TextGame = (props: any) => {
  // 전역 변수
  const isLogin = useReactiveVar(isLoginVar);
  const location = useLocation();
  const history = useHistory();

  const GET_CONTENTS = gql`
    query getContent($id: Int!) {
      getContent(id: $id) {
        userId
        bookMarks {
          id
          userId
          contentId
        }
        question {
          id
          questionBody
          answer {
            id
            body
            winCount
          }
        }
      }
    }
  `;

  const POST_TEXT = gql`
    mutation addCountTxt($id: Int!) {
      addCountTxt(id: $id) {
        ok
        error
      }
    }
  `;

  const POST_BOOKMARK = gql`
    mutation addBookMark($id: Int!) {
      addBookMark(id: $id) {
        ok
        error
      }
    }
  `;

  const POST_DELETEBOOKMARK = gql`
    mutation deleteBookMark($id: Int!) {
      deleteBookMark(id: $id) {
        ok
        error
      }
    }
  `;

  const POST_DELETECONTENT = gql`
    mutation deleteContent($id: Int!) {
      deleteContent(id: $id) {
        ok
        error
      }
    }
  `;

  const [addCountTxt] = useMutation(POST_TEXT);
  const [addBookMark] = useMutation(POST_BOOKMARK, {
    onCompleted: () => {
      return refetch();
    },
    refetchQueries: [
      {
        query: GET_CONTENTS,
        variables: {
          id: +props.gameid,
        },
      },
    ],
    awaitRefetchQueries: true,
  });
  const [deleteBookMark] = useMutation(POST_DELETEBOOKMARK);
  const [deleteContent] = useMutation(POST_DELETECONTENT);

  const [questions, setQuestions] = useState([] as any);
  const [answers, setAnswers] = useState([] as any);
  const [rating, setRating] = useState(false);
  const [lastPick, setLastPick] = useState(false);
  const [bookMark, setBookMark] = useState(Boolean);
  const [userBookMark, setUserBookMark] = useState([] as any);
  const [sweetAlertShow, setSweetAlertShow] = useState(false);
  const [sweetAlertLike, setSweetAlertLike] = useState(false);
  const [sweetAlertDelete, setSweetAlertDelete] = useState(false);
  const [doubleClick, setDoubleClick] = useState(true);
  const [modify, setModify] = useState(false);
  const [firstAnswer, setFirstAnswer] = useState(false);
  const [secondAnswer, setSecondAnswer] = useState(false);

  const { refetch } = useQuery(GET_CONTENTS, {
    variables: {
      id: +props.gameid,
    },
    onCompleted: (data) => {
      setQuestions(data.getContent.question);
      setAnswers([
        data.getContent.question[0].answer[0],
        data.getContent.question[0].answer[1],
      ]);
      setUserBookMark(data.getContent.bookMarks);
      if (isLogin) {
        const token = localStorage.getItem("token");
        const userId = jwt.verify(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          token,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          process.env.REACT_APP_SECRET_KEY,
          function (err: any, decoded: any) {
            return decoded.id;
          }
        );
        data.getContent.bookMarks.map((el: any) => {
          if (el.userId === userId) {
            setBookMark(true);
          }
        });
        if (data.getContent.userId === userId) {
          setModify(true);
        }
      }
    },
    fetchPolicy: "cache-and-network",
  });

  const nextBtnHandler = () => {
    const nextQuestions = [...questions];
    nextQuestions.shift();
    setRating(false);
    setFirstAnswer(false);
    setSecondAnswer(false);
    setQuestions(nextQuestions);
    setAnswers([nextQuestions[0].answer[0], nextQuestions[0].answer[1]]);
    setDoubleClick(true);
    return;
  };

  const firstClickHandler = () => {
    addCountTxt({
      variables: {
        id: answers[0].id,
      },
    });
    setRating(true);
    setDoubleClick(false);
    setFirstAnswer(true);
    if (questions.length === 1) {
      setLastPick(true);
    }
  };

  const secondClickHandler = () => {
    addCountTxt({
      variables: {
        id: answers[1].id,
      },
    });
    setRating(true);
    setDoubleClick(false);
    setSecondAnswer(true);
    if (questions.length === 1) {
      setLastPick(true);
    }
  };

  const copyHandler = () => {
    setSweetAlertShow(true);
  };

  const bookMarkBtnHandler = () => {
    addBookMark({
      variables: {
        id: +props.gameid,
      },
    });
    setBookMark(true);
    return;
  };

  const deleteBookMarkBtnHandler = () => {
    let result;
    const token = localStorage.getItem("token");
    const userId = jwt.verify(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      token,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      process.env.REACT_APP_SECRET_KEY,
      function (err: any, decoded: any) {
        return decoded.id;
      }
    );
    userBookMark.map((el: any) => {
      if (el.userId === userId && el.contentId === +props.gameid) {
        result = el.id;
      }
    });
    deleteBookMark({
      variables: {
        id: result,
      },
    });
    setBookMark(false);
    return;
  };

  const notLoginHandler = () => {
    setSweetAlertLike(true);
  };

  const deleteContentBtnHandler = () => {
    setSweetAlertDelete(true);
  };

  return (
    <>
      <SweetAlert
        show={sweetAlertDelete}
        custom
        showCancel
        showCloseButton
        confirmBtnText="삭제"
        cancelBtnText="취소"
        confirmBtnBsStyle="danger"
        cancelBtnBsStyle="light"
        success
        title="삭제하시겠습니까?"
        onConfirm={() => {
          deleteContent({
            variables: {
              id: +props.gameid,
            },
          });
          setSweetAlertDelete(false);
          history.push("/");
          return;
        }}
        onCancel={() => {
          setSweetAlertDelete(false);
          return;
        }}
      ></SweetAlert>
      <SweetAlert
        show={sweetAlertLike}
        custom
        showCancel
        showCloseButton
        confirmBtnText="로그인"
        cancelBtnText="취소"
        confirmBtnBsStyle="secondary"
        cancelBtnBsStyle="light"
        success
        title="로그인이 필요한 기능입니다."
        onConfirm={() => {
          history.push("/login");
          setSweetAlertLike(false);
          return;
        }}
        onCancel={() => {
          setSweetAlertLike(false);
          return;
        }}
      ></SweetAlert>
      <SweetAlert
        show={sweetAlertShow}
        showConfirm={false}
        success
        title="클립보드에 복사되었습니다."
        onConfirm={() => {
          setSweetAlertShow(false);
          return;
        }}
        onCancel={() => {
          setSweetAlertShow(false);
          return;
        }}
      >{`https://urtest.shop${location.pathname}`}</SweetAlert>
      {questions.length === 0 ? (
        <Loading />
      ) : (
        <Container className="mt-3">
          <div style={{ textAlign: "center" }}>
            {isLogin ? (
              bookMark ? (
                <AwesomeButton type="primary" className="m-1">
                  <Button
                    variant="urtest"
                    onClick={() => deleteBookMarkBtnHandler()}
                  >
                    <HeartFill />
                  </Button>
                </AwesomeButton>
              ) : (
                <AwesomeButton type="primary" className="m-1">
                  <Button variant="urtest" onClick={() => bookMarkBtnHandler()}>
                    <Heart />
                  </Button>
                </AwesomeButton>
              )
            ) : (
              <AwesomeButton type="primary" className="m-1">
                <Button variant="urtest" onClick={() => notLoginHandler()}>
                  <Heart />
                </Button>
              </AwesomeButton>
            )}
            <LinkContainer to={`/analytics/${+props.gameid}/`}>
              <AwesomeButton type="primary" className="m-1">
                <Button variant="urtest">
                  <Trophy />
                </Button>
              </AwesomeButton>
            </LinkContainer>
            <AwesomeButton type="primary" className="m-1">
              <CopyToClipboard
                text={`https://urtest.shop${location.pathname}`}
                onCopy={() => copyHandler()}
              >
                <Button variant="urtest">
                  <ShareFill />
                </Button>
              </CopyToClipboard>
            </AwesomeButton>
            {modify ? (
              <>
                <LinkContainer to={`/modifytext/${+props.gameid}/`}>
                  <AwesomeButton type="primary" className="m-1">
                    <Button variant="urtest">
                      <Pen />
                    </Button>
                  </AwesomeButton>
                </LinkContainer>
                <AwesomeButton type="primary" className="m-1">
                  <Button
                    variant="urtest"
                    onClick={() => deleteContentBtnHandler()}
                  >
                    <Trash />
                  </Button>
                </AwesomeButton>
              </>
            ) : (
              ""
            )}
          </div>
          <h1 className="textgame-title font-jua m-5">
            {questions[0].questionBody}
          </h1>
          <CardDeck>
            <Card
              onClick={() =>
                doubleClick ? firstClickHandler() : console.log(doubleClick)
              }
            >
              <Card.Body className={firstAnswer ? "textgame-pick" : ""}>
                <Card.Text className="textgame-answer">
                  {answers[0].body}
                </Card.Text>
                {rating ? (
                  <Fade>
                    <Card.Text style={{ color: "red", textAlign: "center" }}>
                      {isNaN(
                        (answers[0].winCount /
                          (answers[0].winCount + answers[1].winCount)) *
                          100
                      )
                        ? "선택률 0%"
                        : `선택률 ${(
                            (answers[0].winCount /
                              (answers[0].winCount + answers[1].winCount)) *
                            100
                          ).toFixed(0)}%`}
                    </Card.Text>
                  </Fade>
                ) : (
                  ""
                )}
              </Card.Body>
            </Card>
            <Card
              onClick={() =>
                doubleClick ? secondClickHandler() : console.log(doubleClick)
              }
            >
              <Card.Body className={secondAnswer ? "textgame-pick" : ""}>
                <Card.Text className="textgame-answer">
                  {answers[1].body}
                </Card.Text>
                {rating ? (
                  <Fade>
                    <Card.Text style={{ color: "red", textAlign: "center" }}>
                      {isNaN(
                        (answers[1].winCount /
                          (answers[0].winCount + answers[1].winCount)) *
                          100
                      )
                        ? "선택률 0%"
                        : `선택률 ${(
                            (answers[1].winCount /
                              (answers[0].winCount + answers[1].winCount)) *
                            100
                          ).toFixed(0)}%`}
                    </Card.Text>
                  </Fade>
                ) : (
                  ""
                )}
              </Card.Body>
            </Card>
          </CardDeck>
          {rating ? (
            lastPick ? (
              ""
            ) : (
              <div className="mt-4" style={{ textAlign: "center" }}>
                {" "}
                <AwesomeButton type="primary" className="m-1">
                  <Button variant="urtest" onClick={() => nextBtnHandler()}>
                    다음 질문
                  </Button>
                </AwesomeButton>
              </div>
            )
          ) : (
            ""
          )}
          {lastPick ? (
            <div className="mt-4" style={{ textAlign: "center" }}>
              게임이 종료되었습니다.
              <div className="mt-4">
                <LinkContainer to={`/textgame/${+props.gameid}/`}>
                  <AwesomeButton type="primary" className="m-1">
                    <Button variant="urtest">다시하기</Button>
                  </AwesomeButton>
                </LinkContainer>
                <LinkContainer to={`/analytics/${+props.gameid}/`}>
                  <AwesomeButton type="primary" className="m-1">
                    <Button variant="urtest">랭킹보기</Button>
                  </AwesomeButton>
                </LinkContainer>
                <AwesomeButton type="primary" className="m-1">
                  <CopyToClipboard
                    text={`https://urtest.shop${location.pathname}`}
                    onCopy={() => copyHandler()}
                  >
                    <Button variant="urtest">
                      <ShareFill />
                    </Button>
                  </CopyToClipboard>
                </AwesomeButton>
              </div>
            </div>
          ) : (
            ""
          )}
        </Container>
      )}
    </>
  );
};

export default TextGame;

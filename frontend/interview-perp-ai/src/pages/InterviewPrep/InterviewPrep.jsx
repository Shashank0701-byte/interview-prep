import React, { useState, useEffect } from 'react'; // useEffect is commonly used with fetch
import { useParams } from "react-router-dom";
import moment from "moment";
import { AnimatePresence, motion } from "framer-motion";
import { LuCircleAlert, LuListCollapse } from "react-icons/lu";
import SpinnerLoader from "../../components/Loader/SpinnerLoader";
import {toast} from "react-hot-toast";
import DashboardLayout from '../../components/layouts/DashboardLayout';
import RoleInfoHeader from './components/RoleInfoHeader';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import QuestionCard from '../../components/Cards/QuestionCard';
import Drawer from '../../components/Drawer';
import SkeletonLoader from '../../components/Loader/SkeletonLoader';
import AIResponsePreview from './components/AIResponsePreview';



const InterviewPrep = () => {
  const { sessionId } = useParams();

  const [sessionData, setSessionData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [openLearnMoreDrawer, setOpenLearnMoreDrawer] = useState(false);
  const [explanation, setExplanation] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateLoader, setIsUpdateLoader] = useState(false);

      const handleSaveNote = async (questionId, note) => {
        try {
            setIsUpdateLoader(true); // Indicate that an update is in progress
            const response = await axiosInstance.put(API_PATHS.QUESTION.ADD_NOTE(questionId), { note });

            if (response.data) {
                toast.success("Note saved successfully!");
                // Refresh the session data to show the updated note
                fetchSessionDetailsById();
            }
        } catch (error) {
            toast.error("Failed to save note.");
            console.error("Error saving note:", error);
        } finally {
            setIsUpdateLoader(false);
        }
    };

  // Fetch session data by session id
  const fetchSessionDetailsById = async () => {
    try{
      const response = await axiosInstance.get(
        API_PATHS.SESSION.GET_ONE(sessionId)
      );
      if(response.data && response.data.session){
        setSessionData(response.data.session);
      }
    }catch (error){
      console.log("Error:", error);
    }
  };

// Generate Concept Explanation
const generateConceptExplanation = async (question) => {
  
  try {
    setErrorMsg("");
    setExplanation(null);
    setIsUpdateLoader(true);

    setOpenLearnMoreDrawer(true);

    const response = await axiosInstance.post(
      API_PATHS.AI.GENERATE_EXPLANATION,
      {
        question,
      }
    );
    if(response.data){
      setExplanation(response.data);
    }
  }catch (error){
    setExplanation(null)
    setErrorMsg("Failed to generate explanation. Try again later");
    console.error("Error:" ,error);
  }finally{
    setIsUpdateLoader(false);
  }
}


// Pin Question
const toggleQuestionPinStatus = async (questionId) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.QUESTION.PIN(questionId)
    );

    console.log(response);

    if (response.data && response.data.question) {
      // toast.success('Question Pinned Successfully')
      fetchSessionDetailsById();
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Toggle for Marked as Mastered
const handleToggleMastered = async (questionId) => {
        try {
            await axiosInstance.put(API_PATHS.QUESTION.TOGGLE_MASTERED(questionId));
            // Re-fetch the session data to update the UI
            fetchSessionDetailsById();
        } catch (error) {
            toast.error("Failed to update status.");
            console.error("Error toggling mastered status:", error);
        }
    };

// Add more questions to a session
// In your InterviewPrep.jsx file

const uploadMoreQuestions = async () => {
  try {
    setIsUpdateLoader(true);

    // Call AI API to generate questions
    const aiResponse = await axiosInstance.post(
      API_PATHS.AI.GENERATE_QUESTIONS,
      {
        role: sessionData?.role,
        experience: sessionData?.experience,
        topicsToFocus: sessionData?.topicsToFocus,
        numberOfQuestions: 10, // Or any number you prefer
      }
    );
    
    // Safely get the questions array from the AI response
    const generatedQuestions = aiResponse.data;

    // Validate that we received a proper array
    // if (!Array.isArray(generatedQuestions)) {
    //     throw new Error("AI did not return a valid list of questions.");
    // }

    // Call the backend to add the new questions to the session
    const response = await axiosInstance.post(
      API_PATHS.QUESTION.ADD_TO_SESSION,
      {
        sessionId,
        questions: generatedQuestions,
      }
    );

    if (response.data) {
      toast.success("Added More Q&A!");
      fetchSessionDetailsById(); // Refresh the data on the page
    }
  } catch (error) {
    if (error.response && error.response.data.message){
      setErrorMsg(error.response.data.message);
    }else{
      setErrorMsg("Something went wrong. Please try again");
    }
  }finally{
    setIsUpdateLoader(false);
  }
};

useEffect(() => {
  if (sessionId) {
    fetchSessionDetailsById();
  }
  return () => {};
}, [] );

 // --- CONDITIONAL RENDERING ---
    if (isLoading) {
        return <DashboardLayout><div className="flex-center h-screen"><SpinnerLoader /></div></DashboardLayout>;
    }

    if (!sessionData) {
        return <DashboardLayout><div className="flex-center h-screen"><p>Session not found.</p></div></DashboardLayout>;
    }

return (
  <DashboardLayout>
    <RoleInfoHeader
      role={sessionData?.role || ""}
      topicsToFocus={sessionData?.topicsToFocus || ""}
      experience={sessionData?.experience || "-"}
      questions={sessionData?.questions?.length || "-"}
      description={sessionData?.description || ""}
      lastUpdated={
        sessionData?.updatedAt
        ? moment(sessionData.updatedAt).format("Do MMM YYYY")
        : ""
        }
      />
      <div className='container mx-auto pt-4 pb-4 px-4 md:px-8'>
        <h2 className='text-lg font-semibold color-black'>Interview Q & A</h2>
        <div className='grid grid-cols-12 gap-4 mt-5 mb-10'>
          <div
            className={`col-span-12 ${
              openLearnMoreDrawer ? "md:col-span-7" : "md:col-span-8"
            }`}
          >
            <AnimatePresence>
              {sessionData?.questions?.map((data, index) => {
                return(
                  <motion.div
                    key={data._id || index}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{opacity: 0, scale:0.95 }}
                    transition={{
                      duration: 0.4,
                      type:"spring",
                      stiffness: 100,
                      delay: index*0.1,
                      damping:15,
                    }}
                    layout
                    layoutId={`question-${data._id || index}`}
                  >
                    <>
                      <QuestionCard
                        questionId={data._id}
                        question={data?.question}
                        answer={data?.answer}
                        userNote={data.userNote}
                        onSaveNote={handleSaveNote}
                        isMastered={data.isMastered}
                        onToggleMastered={() => 
                          handleToggleMastered(data._id)}
                        onLearnMore={() =>
                          generateConceptExplanation(data.question)
                        }
                        isPinned={data?.isPinned}
                        onTogglePin={() =>
                          toggleQuestionPinStatus(data._id)
                        }
                      />
                      

                      {!isLoading && 
                          sessionData?.questions?.length == index + 1 && (
                            <div className='flex items-center justify-center mt-5'>
                              <button
                                className='flex items-center gap-3 text-sm text-white font-medium bg-black px-5 py-2 mr-2 rounded text-nowrap cursor-pointer'
                                disabled={isLoading || isUpdateLoader}
                                onClick={uploadMoreQuestions}
                              >
                                {isUpdateLoader ? (
                                  <SpinnerLoader />
                                ):(
                                  <LuListCollapse className='text-lg' />
                                )}{" "}
                                Load More
                              </button>
                              </div>
                          )}
                          </>
                      </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
          </div>

          <div>
            <Drawer
              isOpen={openLearnMoreDrawer}
              onClose={() => setOpenLearnMoreDrawer(false)}
              title={!isLoading && explanation?.title}
            >
              {errorMsg && (
              <p className="flex gap-2 text-sm text-amber-600 font-medium">
              <LuCircleAlert className="mt-1" /> {errorMsg}
              </p>
              )}
                {isLoading && <SkeletonLoader />}
              {!isLoading && explanation && (
                <AIResponsePreview content={explanation?.explanation || explanation} />

              )}
            </Drawer>
          </div>
          </div>
  </DashboardLayout>
   )
}

export default InterviewPrep;
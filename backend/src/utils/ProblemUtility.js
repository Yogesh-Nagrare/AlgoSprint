const axios = require('axios');


const getLanguageById = (lang)=>{

    const language = {
        "c++":54,
        "java":62,
        "javascript":63
    }


    return language[lang.toLowerCase()];
}


const submitBatch = async (submissions)=>{

const options = {
  method: 'POST',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params: {
    base64_encoded: 'false'
  },
  headers: {
    'x-rapidapi-key': process.env.JUDGE0_KEY,
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
    'Content-Type': 'application/json'
  },
  data: {
    submissions
  }
};

async function fetchData() {
    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
console.error("Judge0 Batch Submit Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to submit to Judge0");    }
}

 return await fetchData();

}


// const waiting = async(timer)=>{
//   setTimeout(()=>{
//     return 1;
//   },timer);
// }
const waiting = (timer) =>
  new Promise(resolve => setTimeout(resolve, timer));

// ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]

const submitToken = async(resultToken)=>{

const options = {
  method: 'GET',
  url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
  params: {
    tokens: resultToken.join(","),
    base64_encoded: 'false',
    fields: '*'
  },
  headers: {
    'x-rapidapi-key': process.env.JUDGE0_KEY,
    'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
  }
};

async function fetchData() {
    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.error(error);
    }
}


while (true) {
        try {
            const response = await axios.request(options);
            const result = response.data;

            if (!result || !result.submissions) {
                throw new Error("Invalid response from Judge0");
            }

            const isResultObtained = result.submissions.every((r) => r.status_id > 2);

            if (isResultObtained) {
                return result.submissions;
            }

            await waiting(1000);
        } catch (error) {
            console.error("Judge0 Polling Error:", error.message);
            throw error;
        }
    }
}


module.exports = {getLanguageById,submitBatch,submitToken};




//google ai studio
// const axios = require('axios');

// const getLanguageById = (lang) => {
//     const language = {
//         "c++": 54,
//         "java": 62,
//         "javascript": 63
//     };
//     return language[lang.toLowerCase()];
// }

// const submitBatch = async (submissions) => {
//     const options = {
//         method: 'POST',
//         url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
//         params: { base64_encoded: 'false' },
//         headers: {
//             'x-rapidapi-key': process.env.JUDGE0_KEY,
//             'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
//             'Content-Type': 'application/json'
//         },
//         data: { submissions }
//     };

//     try {
//         const response = await axios.request(options);
//         // Judge0 POST /batch returns an ARRAY: [{token: "..."}, {token: "..."}]
//         return response.data; 
//     } catch (error) {
//         // IMPORTANT: Throw the error so the controller knows it failed
//         console.error("Judge0 Batch Post Error:", error.response?.data || error.message);
//         throw new Error(error.response?.data?.message || "Failed to post to Judge0");
//     }
// }

// const waiting = (timer) => new Promise(resolve => setTimeout(resolve, timer));

// const submitToken = async (resultToken) => {
//     const options = {
//         method: 'GET',
//         url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
//         params: {
//             tokens: resultToken.join(","),
//             base64_encoded: 'false',
//             fields: '*'
//         },
//         headers: {
//             'x-rapidapi-key': process.env.JUDGE0_KEY,
//             'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
//         }
//     };

//     // Polling Loop
//     while (true) {
//         try {
//             const response = await axios.request(options);
//             const result = response.data;

//             if (!result.submissions) {
//                 throw new Error("Invalid response from Judge0 polling");
//             }

//             // Check if every submission has finished processing (status_id > 2)
//             // 1 = In Queue, 2 = Processing
//             const isResultObtained = result.submissions.every((r) => r.status_id > 2);

//             if (isResultObtained) {
//                 return result.submissions;
//             }

//             // Wait 1 second before polling again
//             await waiting(1000);
//         } catch (error) {
//             console.error("Judge0 Polling Error:", error.message);
//             throw error;
//         }
//     }
// }

// module.exports = { getLanguageById, submitBatch, submitToken };







// 



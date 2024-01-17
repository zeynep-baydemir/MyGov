import { ethers } from "./ethers-5.6.esm.min.js";
import { contractAddress,USDTokenContractAddress, abi , USDTokenAbi} from "./constants.js";
import { BigNumber } from "./ethers-5.6.esm.min.js";

const connectButton = document.getElementById("connectButton");
connectButton.onclick = connect;
const approveContractB = document.getElementById("approveContractB");
approveContractB.onclick = approveContract;
const approveContractUSDT = document.getElementById("approveContractUSDT");
approveContractUSDT.onclick = approveUSDTContract;
const faucetButton = document.getElementById("faucetButton");
faucetButton.onclick = faucet;
const donateUSDButton = document.getElementById("donateUSDButton");
donateUSDButton.onclick = donateUSD;
const donateMyGovTokenButton = document.getElementById("donateMyGovTokenButton");
donateMyGovTokenButton.onclick = donateMyGovToken;
const submitSurveyButton = document.getElementById("submitSurveyButton");
submitSurveyButton.onclick = submitSurvey;
const takeSurveyButton = document.getElementById("takeSurveyButton");
takeSurveyButton.onclick = takeSurvey;
const getSurveyResultsButton = document.getElementById("getSurveyResultsButton");
getSurveyResultsButton.onclick = getSurveyResults;
const getSurveyOwnerButton = document.getElementById("getSurveyOwnerButton");
getSurveyOwnerButton.onclick = getSurveyOwner;
const getNoOfSurveysButton = document.getElementById("getNoOfSurveysButton");
getNoOfSurveysButton.onclick = getNoOfSurveys;
const submitProjectProposalButton = document.getElementById("submitProjectProposalButton");
submitProjectProposalButton.onclick = submitProjectProposal;
const getIsProjectFundedButton = document.getElementById("getIsProjectFundedButton");
getIsProjectFundedButton.onclick = getIsProjectFunded;
const voteForProjectProposalButton = document.getElementById("voteForProjectProposalButton");
voteForProjectProposalButton.onclick = voteForProjectProposal;
const getProjectNextPaymentButton = document.getElementById("getProjectNextPaymentButton");
getProjectNextPaymentButton.onclick = getProjectNextPayment;
const getProjectInfoButton = document.getElementById("getProjectInfoButton");
getProjectInfoButton.onclick = getProjectInfo;
const getNoOfFundedProjectsButton = document.getElementById("getNoOfFundedProjectsButton");
getNoOfFundedProjectsButton.onclick = getNoOfFundedProjects;
const getUSDReceivedByProjectButton = document.getElementById("getUSDReceivedByProjectButton");
getUSDReceivedByProjectButton.onclick = getUSDReceivedByProject;
const reserveProjectGrantButton = document.getElementById("reserveProjectGrantButton");
reserveProjectGrantButton.onclick = reserveProjectGrant;
const withdrawProjectPaymentButton = document.getElementById("withdrawProjectPaymentButton");
withdrawProjectPaymentButton.onclick = withdrawProjectPayment;
const voteForProjectPaymentButton = document.getElementById("voteForProjectPaymentButton");
voteForProjectPaymentButton.onclick = voteForProjectPayment;
const delegateVoteToButton = document.getElementById("delegateVoteToButton");
delegateVoteToButton.onclick = delegateVoteTo;
const getSurveyInfoButton = document.getElementById("getSurveyInfoButton");
getSurveyInfoButton.onclick = getSurveyInfo;
const getProjectOwnerButton = document.getElementById("getProjectOwnerButton");
getProjectOwnerButton.onclick = getProjectOwner;
const getNoOfProjectProposalsButton = document.getElementById("getNoOfProjectProposalsButton");
getNoOfProjectProposalsButton.onclick = getNoOfProjectProposals;
const takeSurveyError = document.getElementById("takeSurveyError");

const provider = new ethers.providers.Web3Provider(window.ethereum)
const signer = provider.getSigner()
const contract = new ethers.Contract(contractAddress, abi, signer)
const USDTcontract = new ethers.Contract(USDTokenContractAddress, USDTokenAbi, signer)

async function connect(){
    try {
        if (typeof window.ethereum !== "undefined"){
            await window.ethereum.request({method: "eth_requestAccounts"})
            connectButton.innerHTML= "Connected !"
            const accounts = await window.ethereum.request({method: "eth_accounts"})
            console.log(accounts)
        }
    } catch (error) {
        console.log(error)
        handleSurveyError(error);
    }
    
}

async function approveContract(){
    try {
        const approveContractResponse = await contract.approveContract()
        await approveContractResponse.wait(1)
    } catch (error) {
        console.log(error)
        handleSurveyError(error);
    }
}

async function approveUSDTContract(){
    try {
        const amount = document.getElementById("approveUSDAmount").value;
        const accounts = await window.ethereum.request({method: "eth_accounts"})
        const approveUSDTContractResponse = await USDTcontract.approve( contractAddress, ethers.utils.parseEther(amount))
        await approveUSDTContractResponse.wait(1)
    } catch (error) {
        console.log(error)
        handleSurveyError(error);
    }
}

async function donateUSD(){
    try {
        const amount = document.getElementById("donateUSDAmount").value;
        const donateUSDResponse = await contract.donateUSD(ethers.utils.parseEther(amount))
        await donateUSDResponse.wait(1)
        console.log(donateUSDResponse)
    } catch (error) {
        console.log(error)
        handleSurveyError(error);
    }
}

async function donateMyGovToken(){
    try {
        const amount = document.getElementById("donateGovAmount").value;
        const donateMyGovTokenResponse = await contract.donateMyGovToken(ethers.utils.parseEther(amount))
        await donateMyGovTokenResponse.wait(1)
        console.log(donateMyGovTokenResponse)
    } catch (error) {
        console.log(error)
        handleSurveyError(error);
    }
}

async function faucet(){
    try {
        const faucetResponse = await contract.faucet()
        await faucetResponse.wait(1)
    } catch (error) {
        console.log(error)
        handleSurveyError(error);
    }
}

async function submitSurvey(){
    try {
        const ipfsHash = document.getElementById("ipfsHash").value;
        const surveyDeadline = document.getElementById("surveyDeadline").value;
        const numChoices = document.getElementById("numChoices").value;
        const atMostChoice = document.getElementById("atMostChoice").value;
        const submitSurveyResponse = await contract.submitSurvey(ipfsHash, ethers.BigNumber.from(surveyDeadline),ethers.BigNumber.from(numChoices),ethers.BigNumber.from(atMostChoice))
        await submitSurveyResponse.wait(1)
        console.log(submitSurveyResponse)
    } catch (error) {
        console.log(error)
        handleSurveyError(error);
    }
}

async function takeSurvey(){
    try {
        const surveyId = document.getElementById("takeSurveyId").value;
        const choices = document.getElementById("choices").value;
        const intArray = choices.split(',').map(Number);

        const takeSurveyResponse = await contract.takeSurvey(ethers.BigNumber.from(surveyId), intArray)
        await takeSurveyResponse.wait(1)

        console.log(takeSurveyResponse)
    } catch (error) {
        console.log(error)
        handleSurveyError(error);
    }
}

function handleSurveyError(error) {
    // Display the error message on the webpage
    const errorContainer = document.getElementById("Error");
    errorContainer.innerHTML = `<p>Error: ${error.error.message}</p>`;
    
    // You can customize the error handling further, e.g., log the error or show/hide elements on the page.
}
async function getSurveyResults(){
    try {
        const surveyId = document.getElementById("resultSurveyId").value;
        const getSurveyResultsResponse = await contract.getSurveyResults(ethers.BigNumber.from(surveyId))
        console.log(getSurveyResultsResponse);

        const stringValue = getSurveyResultsResponse[1]; 
        const numberValue1 = BigNumber.from(getSurveyResultsResponse[0]).toString();
        let data = stringValue.map(result => parseInt(result._hex, 16));

        const formattedResponse = {
            numberOfTaken: numberValue1,
            results: data,
        };
        const surveyResultsElement = document.getElementById('surveyResult');
        surveyResultsElement.textContent = JSON.stringify(formattedResponse); 
        console.log(formattedResponse);
    } catch (error) {
        console.log(error)
        handleSurveyError(error);
    }
}

async function getSurveyOwner(){
    try {
        const surveyOwner = document.getElementById("ownerSurveyId").value;
        const getSurveyOwnerResponse = await contract.getSurveyOwner(ethers.BigNumber.from(surveyOwner))
        
        const surveyOwnerElement = document.getElementById('surveyOwner');
        surveyOwnerElement.textContent = getSurveyOwnerResponse;

        console.log(getSurveyOwnerResponse) 
    } catch (error) {
        console.log(error)
        handleSurveyError(error);
    }
}

async function getNoOfSurveys(){
    try {
        const getNoOfSurveysResponse = await contract.getNoOfSurveys()
        const surveyCountElement = document.getElementById('surveyCount');
        surveyCountElement.textContent = getNoOfSurveysResponse;
        console.log(getNoOfSurveysResponse)
    } catch (error) {
        console.log(error)
        handleSurveyError(error);
    }
}

async function submitProjectProposal(){
    try {
        const ipfsHash = document.getElementById("ipfsHash2").value;
        const votedeadline = document.getElementById("voteDeadline").value;
        const paymentamounts = document.getElementById("paymentAmounts").value;
        const paymentArray = paymentamounts.split(',').map(Number);
        const payschedule = document.getElementById("paySchedule").value;
        const scheduleArray = payschedule.split(',').map(Number);
        const submitProjectProposalResponse = await contract.submitProjectProposal(ipfsHash, ethers.BigNumber.from(votedeadline),paymentArray,scheduleArray)
        await submitProjectProposalResponse.wait(1)
        console.log(submitProjectProposalResponse)
    } catch (error) {
        console.log(error)
        handleSurveyError(error);
    }
}

async function getIsProjectFunded(){
    try {
        const projectid = document.getElementById("fundedProjectId").value;
        const getIsProjectFundedResponse = await contract.getIsProjectFunded(ethers.BigNumber.from(projectid))
        const isFundedElement = document.getElementById('isFunded');
        isFundedElement.textContent = getIsProjectFundedResponse;
        console.log(getIsProjectFundedResponse) 
    } catch (error) {
        console.log(error)
        handleSurveyError(error);
    }
}

async function voteForProjectProposal(){
    try {
        const projectId = document.getElementById("voteProjectId").value;
        const choice = document.getElementById("choiceVoteProject").value; //bu bool nası alcam idk
        const voteForProjectProposalResponse = await contract.voteForProjectProposal(ethers.BigNumber.from(projectId), choice)
        await voteForProjectProposalResponse.wait(1)
        console.log(voteForProjectProposalResponse)
    } catch (error) {
        console.log(error)
        handleSurveyError(error);
    }
}

async function getProjectNextPayment(){
    try {
        const projectid = document.getElementById("nextPaymentProjectId").value;
        const getProjectNextPaymentResponse = await contract.getProjectNextPayment(ethers.BigNumber.from(projectid))
        const nextPaymentElement = document.getElementById('nextPayment');
        nextPaymentElement.textContent = getProjectNextPaymentResponse;
        console.log(getProjectNextPaymentResponse) 
    } catch (error) {
        console.log(error)
        handleSurveyError(error);
    }
}

async function getProjectInfo(){
    try {
        const projectid = document.getElementById("projectIdInfo").value;
        const getProjectInfoResponse = await contract.getProjectInfo(ethers.BigNumber.from(projectid))

        const stringValue = getProjectInfoResponse[0]; 
        const numberValue1 = BigNumber.from(getProjectInfoResponse[1]).toString();
        const paymentAmounts = getProjectInfoResponse[2];
        const paySchedule = getProjectInfoResponse[3];
        let paymentData = paymentAmounts.map(result => parseInt(result._hex, 16));
        let payScheduleData = paySchedule.map(result => parseInt(result._hex, 16));
        const formattedResponse = {
            ipfsHash: stringValue,
            surveyDeadline: numberValue1,
            paymentAmounts: paymentData,
            paySchedule:payScheduleData,
        };
        const projectInfoElement = document.getElementById('projectInfo');
        projectInfoElement.textContent = JSON.stringify(formattedResponse); 
        console.log(formattedResponse);

    } catch (error) {
        console.log(error)
        handleSurveyError(error);
    }
}

async function getNoOfFundedProjects(){
    try {
        const getNoOfFundedProjectsResponse = await contract.getNoOfFundedProjects();
        const fundedProjectCountElement = document.getElementById('fundedProjectCount');
        fundedProjectCountElement.textContent = getNoOfFundedProjectsResponse;
        console.log(getNoOfFundedProjectsResponse)
    } catch (error) {
        console.log(error)
        handleSurveyError(error);
    }
}

async function getUSDReceivedByProject(){
    try {
        const projectid = document.getElementById("projectIdReceiveUSD").value;
        const getUSDReceivedByProjectResponse = await contract.getUSDReceivedByProject(ethers.BigNumber.from(projectid))
        const projectReceiveUSDElement = document.getElementById('projectReceiveUSD');
        projectReceiveUSDElement.textContent = getUSDReceivedByProjectResponse;
        console.log(getUSDReceivedByProjectResponse) 
    } catch (error) {
        console.log(error)
        handleSurveyError(error);
    }
}

async function reserveProjectGrant(){
    try {
        const projectId = document.getElementById("reserveProjectId").value;
        const reserveProjectGrantResponse = await contract.reserveProjectGrant(ethers.BigNumber.from(projectId))
        await reserveProjectGrantResponse.wait(1)
        console.log(reserveProjectGrantResponse)
    } catch (error) {
        console.log(error)
        handleSurveyError(error);
    }
}

async function withdrawProjectPayment(){
    try {
        const projectId = document.getElementById("withdrawProjectId").value;
        const withdrawProjectPaymentResponse = await contract.withdrawProjectPayment(ethers.BigNumber.from(projectId))
        await withdrawProjectPaymentResponse.wait(1)
        console.log(withdrawProjectPaymentResponse)
    } catch (error) {
        console.log(error)
        handleSurveyError(error);
    }
}

async function voteForProjectPayment(){
    try {
        const projectId = document.getElementById("voteProjectPaymentId").value;
        const choice = document.getElementById("choiceVoteProjectPayment").value; //bu bool nası alcam idk
        const voteForProjectPaymentResponse = await contract.voteForProjectPayment(ethers.BigNumber.from(projectId), choice)
        await voteForProjectPaymentResponse.wait(1)
        console.log(voteForProjectPaymentResponse)
    } catch (error) {
        console.log(error)
        handleSurveyError(error);
    }
}

async function delegateVoteTo(){
    try {
        const memberAddress = document.getElementById("memberAddress").value; //address parseBytes32String botle mi 
        const projectId = document.getElementById("delegateVoteProjectId").value;
        const delegateVoteToResponse = await contract.delegateVoteTo(memberAddress,ethers.BigNumber.from(projectId))
        await delegateVoteToResponse.wait(1)
        console.log(delegateVoteToResponse)
    } catch (error) {
        console.log(error)
        handleSurveyError(error);
    }
}


async function getSurveyInfo() {
    try {
        const surveyId = document.getElementById("surveyIdInfo").value;
        const getSurveyInfoResponse = await contract.getSurveyInfo(surveyId);

        const stringValue = getSurveyInfoResponse[0]; 
        const numberValue1 = BigNumber.from(getSurveyInfoResponse[1]).toString();
        const numberValue2 = BigNumber.from(getSurveyInfoResponse[2]).toString();
        const numberValue3 = BigNumber.from(getSurveyInfoResponse[3]).toString();
        const formattedResponse = {
            ipfsHash: stringValue,
            surveyDeadline: numberValue1,
            numberOfChoices: numberValue2,
            atMostChoice: numberValue3,
        };
        const surveyInfoElement = document.getElementById('surveyInfo');
        surveyInfoElement.textContent = JSON.stringify(formattedResponse); 
        console.log(formattedResponse);
    } catch (error) {
        console.log(error)
        handleSurveyError(error);
    }
}


async function getProjectOwner(){
    try {
        const projectid = document.getElementById("projectIdforOwner").value;
        const getProjectOwnerResponse = await contract.getProjectOwner(ethers.BigNumber.from(projectid))
        const projectOwnerElement = document.getElementById('projectOwner');
        projectOwnerElement.textContent = getProjectOwnerResponse;

        console.log(getProjectOwnerResponse) 
    } catch (error) {
        console.log(error)
        handleSurveyError(error);
    }
}

async function getNoOfProjectProposals(){
    try {
        const getNoOfProjectProposalsResponse = await contract.getNoOfProjectProposals()
        const numberOfProposalsElement = document.getElementById('numberOfProposals');
        numberOfProposalsElement.textContent = getNoOfProjectProposalsResponse;
        console.log(getNoOfProjectProposalsResponse)
    } catch (error) {
        console.log(error)
        handleSurveyError(error);
    }
}

async function transfer(){
    try {
        const receiverAddress = document.getElementById("receiverAddress").value; //address parseBytes32String botle mi 
        const amount = document.getElementById("transferredAmount").value;
        const transferResponse = await contract.transfer(ethers.utils.parseBytes32String(receiverAddress),ethers.utils.parseEther(amount))
        await transferResponse.wait(1)
        console.log(transferResponse)
    } catch (error) {
        console.log(error)
        handleSurveyError(error);
    }
}

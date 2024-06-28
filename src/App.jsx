import React, { useState } from 'react';

import { PageLayout } from './components/PageLayout';
import { loginRequest } from './authConfig';
import { callMsGraph } from './graph';
import { ProfileData } from './components/ProfileData';
import queryString from 'query-string';

import axios from 'axios';

import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import './App.css';
import Button from 'react-bootstrap/Button';

/**
 * Renders information about the signed-in user or a button to retrieve data about the user
 */

const ProfileContent = () => {
  const { instance, accounts } = useMsal();
  const [graphData, setGraphData] = useState(null);

  function RequestProfileData() {
    // Silently acquires an access token which is then attached to a request for MS Graph data
    instance
      .acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      })
      .then((response) => {
        console.log('response ->', response)
        localStorage.setItem('myToken', JSON.stringify(response.accessToken));
        localStorage.setItem('idToken', JSON.stringify(response.idToken));
        callMsGraph(response.accessToken).then((response) => setGraphData(response));
      });
  }

  async function requestData() {
    const query = window.location.search;
    const queryParams = query.substring(1)

    const { code, state } = queryString.parse(queryParams)

    console.log('code ->', code);
    console.log('state ->', state)

    const formData = new FormData();
    formData.append('grant_type', 'authorization_code');
    formData.append('code', code)
    formData.append('scope', 'api://0025dfaf-5acc-468f-a487-a555c2e1adb9/Forecast.Read')
    formData.append('client_id', '292f1906-ac22-426c-939d-8cfd4de84c33')
    formData.append('client_secret', 'SNg8Q~8HFRAxwCAA~ZGI1Ltf5lR0AfbljNTszbzl')
    formData.append('redirect_uri', 'http://localhost:3000')

    const loginMicrosoftUrl = 'https://login.microsoftonline.com/4198ecdb-379e-4e6d-8ae3-b710a7e51541/oauth2/v2.0/token'

    const response = await fetch(loginMicrosoftUrl, {
      method: 'POST',
      body: formData,
      mode: 'no-cors',
      headers: {
        'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
      }
    });

    if (response.ok) {
      const jsonResponse = await response.json();
      console.log(jsonResponse);
    } else {
      console.error('Failed to upload:', response.statusText);
    }

    const res = await axios.post(
      "https://login.microsoftonline.com/4198ecdb-379e-4e6d-8ae3-b710a7e51541/oauth2/v2.0/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        scope: "api://0025dfaf-5acc-468f-a487-a555c2e1adb9/Forecast.Read",
        client_id: "292f1906-ac22-426c-939d-8cfd4de84c33",
        client_secret: "SNg8Q~8HFRAxwCAA~ZGI1Ltf5lR0AfbljNTszbzl",
      })
    );

    console.log("res ->", res)


    // const token = localStorage.getItem('myToken')

    // const apiUrl = 'http://localhost:5007/weatherforecast';

    // const response = await fetch(apiUrl, {
    //   method: 'GET',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json'
    //   }
    // })


    // if (response.ok) {
    //   const json = await response.json()
    //   console.log(json)
    // }




  }

  return (
    <>
      <h5 className="profileContent">Welcome {accounts[0].name}</h5>
      {graphData ? (
        <ProfileData graphData={graphData} />
      ) : (
        <Button variant="secondary" onClick={RequestProfileData}>
          Request Profile
        </Button>
      )}

      <button onClick={async () => await requestData()}>Request Data!</button>

    </>
  );
};

/**
 * If a user is authenticated the ProfileContent component above is rendered. Otherwise a message indicating a user is not authenticated is rendered.
 */
const MainContent = () => {
  return (
    <div className="App">
      <AuthenticatedTemplate>
        <ProfileContent />
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate>
        <h5 className="card-title">Please sign-in to see your profile information.</h5>
      </UnauthenticatedTemplate>
    </div>
  );
};

export default function App() {
  return (
    <PageLayout>
      <MainContent />
    </PageLayout>
  );
}

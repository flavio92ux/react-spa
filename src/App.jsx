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
    const client_id = "292f1906-ac22-426c-939d-8cfd4de84c33"
    const state = "12345"

    const link = `https://login.microsoftonline.com/4198ecdb-379e-4e6d-8ae3-b710a7e51541/oauth2/v2.0/authorize?client_id=${client_id}&response_type=code&redirect_uri=${window.location.origin}&response_mode=query&scope=api%3A%2F%2F0025dfaf-5acc-468f-a487-a555c2e1adb9%2FForecast.Read&state=12345`

    window.location.assign(link);

    const query = window.location.search;
    const queryParams = query.substring(1)

    let { code } = queryString.parse(queryParams)

    // const code = "0.ASUA2-yYQZ43bU6K47cQp-UVQQYZLykirGxCk52M_U3oTDMlAAA.AgABBAIAAAApTwJmzXqdR4BN2miheQMYAgDs_wUA9P-FYfYcn-8RvJYZDWwU3RpQxDg9WSyAG-rfZBpLCFqhR_dmRvBczpHGemNRiaOM3zuGC5Dqb45Jv-G3pkepmruA8IUEeJwg3_pH_AoRxAiqISG9L-GrxI-NjKuu0gbCS6vu-d4lL8RrPW7XPBUQ8AbF6LAe7VKqciqyYv8l2GSx_y-8e_qUPLifKNYBiOBxdeMi5dPkXjUXTgFebEmRzQa0mTtfxVN5e4ATbMIYdFmxPGHApcZI8uPP5Nv7heW8WAXe981HB864IxrksdHP_4CRaE83OxVr2HgA2tE9bIm2UclMQNw1Hx1zOCXz0SAcDrUreYgj8mG-i60--hS_E4UJMySRf_bv2CtlaCqKkun7YS2iTLmpxnLcMm_tRDH4a_ireLvcvOiq5SmtLtA9viOA-jlvTupXasx9FnKLKVRuvFwovs0g9l7gRfieFHpNfhyjFAok_SFHMqvrj6NM-rxd-w105v7nHirMA2p5mYz1YNPj3pAvu31GI1o2Age6awlAMJ6pXBzxowVOiR67Tb5guD70HuIFMauH3mbHRf-f2YaflrzMrQhOuoczkRNm3jUMW3RumRK-_c_5H9lNcsS5nema5m5ModdCrMr1rtoMs421q0LxUFRmz1z1SD3kJDkuFAfWsZIK63E20ISlWxUiiHOuQxDlGTDpNNiLzm2R8HR554tYRnkkFA2tjZizNRVUOwx-OZh2JGhR-xOueCyeAooqNhxF8-82d_3o86s90FPgRhFAQqMfngDEa7qezcJZk5aH-ppr45NphsoBd6qDzb2U8BmWM0tIdyZu"

    console.log('code ->', code);

    const formData = new FormData();
    formData.append('grant_type', 'authorization_code');
    formData.append('code', code)
    formData.append('scope', 'api://0025dfaf-5acc-468f-a487-a555c2e1adb9/Forecast.Read')
    formData.append('client_id', '292f1906-ac22-426c-939d-8cfd4de84c33')
    formData.append('client_secret', 'SNg8Q~8HFRAxwCAA~ZGI1Ltf5lR0AfbljNTszbzl')
    formData.append('redirect_uri',  window.location.origin)

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

    let res;

    const origin = window.location.origin

    try {
      res = await axios.post(
        "https://login.microsoftonline.com/4198ecdb-379e-4e6d-8ae3-b710a7e51541/oauth2/v2.0/token",
        new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          scope: "api://0025dfaf-5acc-468f-a487-a555c2e1adb9/Forecast.Read",
          client_id: "292f1906-ac22-426c-939d-8cfd4de84c33",
          client_secret: "SNg8Q~8HFRAxwCAA~ZGI1Ltf5lR0AfbljNTszbzl",
          redirect_uri: origin
        })
      );
    } catch (error) {
      console.log(error)
    }

    if (res) {
      localStorage.setItem("teste", "teste")
    }


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

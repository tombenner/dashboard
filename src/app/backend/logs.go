// Copyright 2015 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package main

import (
	"io/ioutil"
	api "k8s.io/kubernetes/pkg/api"
	"k8s.io/kubernetes/pkg/api/unversioned"
	client "k8s.io/kubernetes/pkg/client/unversioned"
	"strings"
)

// Log response structure
type Logs struct {
	// Pod id
	PodId string `json:"podId"`
	// Specific time when logs started
	SinceTime unversioned.Time `json:"sinceTime"`
	// Logs string
	Logs []string `json:"logs"`
}

// Return logs for particular pod and container or error when occurred.
func GetPodLogs(client *client.Client, namespace string, podId string, container string) (*Logs,
	error) {

	pod, err := client.Pods(namespace).Get(podId)
	if err != nil {
		return nil, err
	}

	logOptions := &api.PodLogOptions{
		Container:  container,
		Follow:     false,
		Previous:   false,
		Timestamps: true,
	}

	rawLogs, err := getRawPodLogs(client, namespace, podId, logOptions)
	if err != nil {
		return nil, err
	}
	return constructLogs(podId, pod.CreationTimestamp, rawLogs), nil
}

// Construct a request for getting the logs for a pod and retrieves the logs.
func getRawPodLogs(client *client.Client, namespace string, podID string,
	logOptions *api.PodLogOptions) (string, error) {
	req := client.RESTClient.Get().
		Namespace(namespace).
		Name(podID).
		Resource("pods").
		SubResource("log").
		VersionedParams(logOptions, api.Scheme)

	readCloser, err := req.Stream()
	if err != nil {
		return "", err
	}

	defer readCloser.Close()

	result, err := ioutil.ReadAll(readCloser)
	if err != nil {
		return "", err
	}
	return string(result), nil
}

// Return Logs structure for given parameters.
func constructLogs(podId string, sinceTime unversioned.Time, rawLogs string) *Logs {
	logs := &Logs{
		PodId:     podId,
		SinceTime: sinceTime,
		Logs:      strings.Split(rawLogs, "\n"),
	}
	return logs
}

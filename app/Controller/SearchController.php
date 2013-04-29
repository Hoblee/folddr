<?php
App::uses('AppController', 'Controller');

class SearchController extends AppController {

/**
 * This controller does not use a model
 *
 * @var array
 */
	public $uses = array();

	public function index() {
		$this->layout = "home";
		if(empty($this->request->data['Search']['term'])) {
			return false;
		}
		$term = trim($this->request->data['Search']['term']);

		$response = ApiConnection::request('search', null, array('q'=>$term));
		if(!empty($response['result'])) {
			$this->layout = "default";
			shuffle($response['result']);
			$this->set('data',$response['result']);
			// debug($response);die;
		}
	}
}

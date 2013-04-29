<?
App::uses('HttpSocket', 'Network/Http');
App::uses('CakeLogInterface', 'Log');

class ApiConnection {
	public static function request($method, $id = null, $data = array(), $type = 'get') {
		if(is_array($id)) {
			$id = implode('/', $id);
		}

		$args = !empty($id) ? $method.'/'.$id : $method;
		$url = Configure::read('HOBLEE_API.url').'/'.$args.'.json?access_token='.Configure::read('HOBLEE_API.access_token');
		$request['header'][] = 'Accept: application/json';

		$httpSocket = new HttpSocket();

		switch($type) {
			case 'post':
				$return = $httpSocket->post($url, $data, $request);
				CakeLog::write('request', __FUNCTION__ .' line:'. __LINE__ . ' data: ' .json_encode($data,true));

			break;
			case 'get':
			default:
				$return = $httpSocket->get($url, $data, $request);
		}
		// debug(__FUNCTION__ .' line:'. __LINE__ . ' request: type:' .$type . ' id:'.$id.' url:' .$url. ' data:'.print_r($data,true));
		CakeLog::write('request', __FUNCTION__ .' line:'. __LINE__ . ' request: type:' .$type . ' id:'.$id.' url:' .$url);
		CakeLog::write('request', __FUNCTION__ .' line:'. __LINE__ . ' response: ' .$return->body);

		if(!empty($return->body)) {
			$data = json_decode($return->body, true);
			return $data;
		} else {
			return array();
		}
	}
}
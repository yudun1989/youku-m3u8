#coding:utf-8
import re
import requests
import base64

def parse_url(video_url):
	def get_video_id(video_url):
		pattern = re.compile("id_(\w+)")
		match = pattern.findall(video_url)
		if match:
			return match[0]

	def my_encoder(a, c, isToBase64):
		result = ""
		bytes_r = []
		h = 0
		q = 0
		b = []
		f = 0
		for i in range(256):
			b.append(i)
		while h < 256:
			f = (f+b[h]+ord(a[h%(len(a))])) % 256
			temp = b[h]
			b[h] = b[f]
			b[f] = temp
			h+=1
		f = 0;h = 0;q = 0;
		while q < len(c):
			h = (h+1) % 256
			f = (f+b[h]) % 256
			temp = b[h]
			b[h] = b[f]
			b[f] = temp
			x = c[q] ^ b[(b[h] + b[f]) % 256]
			bytes_r.append(x)
			result += chr(x)
			q+=1
		if isToBase64:
			bytes_r = bytearray(bytes_r)
			result = base64.b64encode(bytes_r)
		return result

	vid = get_video_id(video_url)
	if not vid:
		return
	infoUrl = 'http://v.youku.com/player/getPlayList/VideoIDS/'+vid+'/Pf/4/ctype/12/ev/1'
	r = requests.get(infoUrl)
	json_result = r.json()
	video_ip = json_result['data'][0]['ip']
	video_ep = json_result['data'][0]['ep']
	template1 = "becaf9be";
	template2 = "bf7e5f01";
	decoded = base64.b64decode(video_ep)
	bytess = map(lambda x:ord(x), decoded)
	temp = my_encoder(template1, bytess, False)
	temp_splited = temp.split('_')
	sid = temp_splited[0]
	token = temp_splited[1]
	whole = sid + '_' + vid + '_' + token
	new_bytes = map(lambda x:ord(x), whole)
	ep_new = my_encoder(template2, new_bytes, True)
	final_url = "http://pl.youku.com/playlist/m3u8?ctype=12&ep="+ep_new+"&ev=1&keyframe=1&oip="+str(video_ip)+"&sid="+str(sid)+"&token="+token+"&type="+'mp4'+"&vid="+vid
	return final_url


def test():
	print parse_url("http://v.youku.com/v_show/id_XODMyNTI2ODI4.html")

if __name__ == '__main__':
	test()
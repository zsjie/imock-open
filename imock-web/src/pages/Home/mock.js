const mockData = [
    {
        'url': '/todos/51',
        'method': 'GET',
        'responseBody': {
            'userId': 3,
            'id': 51,
            'title': 'hello',
            'completed': false
        },
        'status': 200,
        'requestHeaders': {
            'x-forwarded-for': '127.0.0.1',
            'x-real-ip': '127.0.0.1',
            'host': '127.0.0.1:3066',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
            'x-imock-id': '61966023',
        },
        'responseHeaders': {
            'vary': 'Origin, Accept-Encoding',
            'access-control-allow-origin': 'http://localhost:4001',
            'etag': '"false"',
            'date': 'Sun, 22 Sep 2024 13:39:18 GMT',
            'content-type': 'application/json; charset=utf-8',
            'x-mocked-by-imock': 'true'
        },
        'requestTime': 1729521634551,
        'responseTime': 1729521634855
    },
    {
        'url': '/todos/51',
        'method': 'PUT',
        'responseBody': {
            'userId': 3,
            'id': 51,
            'title': 'hello',
            'completed': false
        },
        'status': 200,
        'requestHeaders': {
            'x-forwarded-for': '127.0.0.1',
            'x-real-ip': '127.0.0.1',
            'host': '127.0.0.1:3066',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
            'x-imock-id': '61966023',
        },
        'responseHeaders': {
            'vary': 'Origin, Accept-Encoding',
        },
        'requestTime': 1729521634551,
        'responseTime': 1729521634855
    },
    {
        'url': '/todos/51',
        'method': 'DELETE',
        'responseBody': {
            'userId': 3,
            'id': 51,
            'title': 'hello',
            'completed': false
        },
        'status': 200,
        'requestHeaders': {
            'x-forwarded-for': '127.0.0.1',
            'x-real-ip': '127.0.0.1',
            'host': '127.0.0.1:3066',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
            'x-imock-id': '61966023',
        },
        'responseHeaders': {
            'vary': 'Origin, Accept-Encoding',
        },
        'requestTime': 1729521634551,
        'responseTime': 1729521634855
    },
    {
        'url': '/todos',
        'method': 'GET',
        'responseBody': {
            'userId': 3,
            'id': 51,
            'title': 'hello',
            'completed': false
        },
        'status': 200,
        'requestHeaders': {
            'x-forwarded-for': '127.0.0.1',
            'x-real-ip': '127.0.0.1',
            'host': '127.0.0.1:3066',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        },
        'responseHeaders': {
            'vary': 'Origin, Accept-Encoding',
            'access-control-allow-origin': 'http://localhost:4001',
            'etag': '"false"',
            'date': 'Sun, 22 Sep 2024 13:39:18 GMT',
            'content-type': 'application/json; charset=utf-8',
            'transfer-encoding': 'chunked',
            'connection': 'close',
            'nel': '{"report_to":"heroku-nel","max_age":3600,"success_fraction":0.005,"failure_fraction":0.05,"response_headers":["Via"]}',
        },
        'requestTime': 1729521634551,
        'responseTime': 1729521634855
    },
    {
        'url': '/todos',
        'method': 'POST',
        'responseBody': [{
            'id': 52,
            'title': 'Commodo id laborum qui id minim ut aute tempor.',
            'completed': false
        },{
            'id': 53,
            'title': 'Commodo id laborum qui id minim ut aute tempor.',
            'completed': false
        },{
            'id': 54,
            'title': 'Commodo id laborum qui id minim ut aute tempor.',
            'completed': true
        },{
            'id': 55,
            'title': 'Commodo id laborum qui id minim ut aute tempor.',
            'completed': false
        },{
            'id': 56,
            'title': 'Commodo id laborum qui id minim ut aute tempor.',
            'completed': true
        },{
            'id': 57,
            'title': 'Commodo id laborum qui id minim ut aute tempor.',
            'completed': false
        }],
        'status': 400,
        'requestHeaders': {
            'x-forwarded-for': '127.0.0.1',
            'x-real-ip': '127.0.0.1',
            'host': '127.0.0.1:3066',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        },
        'responseHeaders': {
            'vary': 'Origin, Accept-Encoding',
            'access-control-allow-origin': 'http://localhost:4001',
            'etag': '"false"',
            'date': 'Sun, 22 Sep 2024 13:39:18 GMT',
            'content-type': 'application/json; charset=utf-8',
            'transfer-encoding': 'chunked',
            'connection': 'close',
            'nel': '{"report_to":"heroku-nel","max_age":3600,"success_fraction":0.005,"failure_fraction":0.05,"response_headers":["Via"]}',
            'x-mocked-by-imock': 'true',
        },
        'requestTime': 1729521634551,
        'responseTime': 1729521634855
    },
]

export default mockData

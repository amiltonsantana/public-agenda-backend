# Data format

## Events

File: `events.json`

```
{
	"id": 1,
	"initialDate": "2019-06-01T13:00:00.000Z",
	"endDate": "2019-06-01T15:00:00.000Z",
	"name": "Conselho Mirim na Câmara",
	"description": "A proposta é uma iniciativa inédita do vereador Celso Giannazi, em parceria com o professor e deputado estadual Carlos Giannazi, e tem como premissa o respeito às ideias das crianças sobre a cidade, em especial sobre a escola e os equipamentos públicos hoje oferecidos à população.",
	"place": "Câmara dos Vereadores",
	"address": "Viaduto Jacareí, 100 - Bela Vista, São Paulo - SP, 01319-020",
	"tags": ["infancia", "camara", "conselho"],
	"link": "http://bit.ly/InscricaoConselhoMirim"
}
```

File: `tags.json`

```
["conselho","camara","infancia","mulher","politica","parque","museu"]
```

File: `subscriptions.json`

```
[
	{
		"user": {
			"id": 140759299,
			"is_bot": false,
			"first_name": "Amilton",
			"last_name": "Santana",
			"username": "amiltonsantana",
			"language_code": "pt-br"
		},
		"creationDate": "2019-06-06T19:27:47.920Z",
		"tags": [
			"museu"
		],
		"subscriptionEvents": [
			{
				"event": {
					"id": 2,
					"initialDate": "2019-06-09T13:00:00.000Z",
					"endDate": "2019-07-14T19:00:00.000Z",
					"name": "Eleição do Conselho Gestor da Casa Modernista",
					"description": "Eleição do Conselho Gestor do Parque Municipal Casa Modernista",
					"place": "Casa Modernista",
					"address": "Rua Santa Cruz, 325 - Vila Mariana",
					"tags": [
						"parque",
						"museu",
						"conselho"
					],
					"link": "http://bit.ly/InscricaoConselhoMirim"
				},
				"alerts": [
					{
						"time": 1,
						"messageSent": false
					},
					{
						"time": 7,
						"messageSent": true
					},
					{
						"time": 30,
						"messageSent": true
					}
				]
			}
		],
		"lastUpdateDate": "2019-06-07T02:32:36.478Z"
	}
]
```

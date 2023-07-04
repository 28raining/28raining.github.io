var startupSchematic =[
        {
            "type": "component",
            "id": "vin",
            "x": 128,
            "y": 144
        },
        {
            "type": "component",
            "id": "L0",
            "x": 192,
            "y": 80
        },
        {
            "type": "component",
            "id": "R0",
            "x": 352,
            "y": 80
        },
        {
            "type": "component",
            "id": "C0",
            "x": 416,
            "y": 112
        },
        {
            "type": "component",
            "id": "gnd",
            "x": 416,
            "y": 192
        },
        {
            "type": "component",
            "id": "xvout",
            "x": 352,
            "y": 16
        },
        {
            "type": "connection",
            "source": {
                "node": "xvout",
                "port": "hybrid0"
            },
            "target": {
                "node": "L0",
                "port": "hybrid1"
            }
        },
        {
            "type": "connection",
            "source": {
                "node": "C0",
                "port": "hybrid0"
            },
            "target": {
                "node": "R0",
                "port": "hybrid1"
            }
        },
        {
            "type": "connection",
            "source": {
                "node": "gnd",
                "port": "hybrid0"
            },
            "target": {
                "node": "C0",
                "port": "hybrid1"
            }
        },
        {
            "type": "connection",
            "source": {
                "node": "L0",
                "port": "hybrid1"
            },
            "target": {
                "node": "R0",
                "port": "hybrid0"
            }
        },
        {
            "type": "connection",
            "source": {
                "node": "L0",
                "port": "hybrid0"
            },
            "target": {
                "node": "vin",
                "port": "hybrid0"
            }
        }
    ];
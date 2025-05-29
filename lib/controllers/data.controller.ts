import Controller from '../interfaces/controller.interface';
import { Request, Response, NextFunction, Router } from 'express';
import { checkIdParam } from '../middlewares/deviceIdParam.middleware';
import DataService from '../modules/services/data.service';

let testArr = [4,5,6,3,5,3,7,5,13,5,6,4,3,6,3,6];

class DataController implements Controller {
   public path = '/api/data';
   public router = Router();
   private dataService: DataService;

   constructor() {
       this.initializeRoutes();
       this.dataService = new DataService();
   }

   private initializeRoutes() {
        this.router.get(`${this.path}/latests`, this.getLatestReadingsFromAllDevices);
        this.router.get(`${this.path}/latest/:id`, checkIdParam, this.getAllDeviceData);
        this.router.post(`${this.path}/:id`, checkIdParam, this.addData);
        this.router.get(`${this.path}/:id`, checkIdParam, this.getElementById);
        this.router.delete(`${this.path}/:id`, this. deleteDeviceData);
         this.router.delete(`${this.path}/all`, this. deleteAllDevicesData);
        this.router.delete(`${this.path}/:id`, checkIdParam, this.deleteElementById);
    }

    private getAllDeviceData = async (request: Request, response: Response, next: NextFunction) => {
   const { id } = request.params;
   const allData = await this.dataService.query(id);
   response.status(200).json(allData);
};

private addData = async (request: Request, response: Response, next: NextFunction) => {
        const { air } = request.body;
        const { id } = request.params;

        const data = {
            temperature: air[0].value,
            pressure: air[1].value,
            humidity: air[2].value,
            deviceId: Number(id),
            readingDate: new Date()
        };

        try {
            await this.dataService.createData(data);
            response.status(200).json(data);
        } catch (error) {
            console.error(`Validation Error: ${error.message}`);
            response.status(400).json({ error: 'Invalid input data.' });
        }
};
 
    private getLatestReadingsFromAllDevices = async (request: Request, response: Response) => {
                try {
            const allLatest = await this.dataService.getAllNewest();
            response.status(200).json(allLatest);
        } catch (error: any) {
            response.status(500).json({ error: error.message });
        }
    }

    private getElementById = async (request: Request, response: Response) => {
        const { id } = request.params;
        const index = Number(id)-1;
        if(isNaN(index) || index >= testArr.length || index < 0)
        {
            response.status(400).send("Error");
            return;
        }
        else
        {
            response.json(testArr[index]);
            return;
        }
    }

    // private getLargestElement = async (request: Request, response: Response) => {
    //     const sortedArray = [...testArr].sort((a, b) => a < b ? 1:-1)
    //     response.json(sortedArray[0])
    // }

    // private getRangeOfElements = async (request: Request, response: Response, next: NextFunction) => {
    //     const id = parseInt(request.params.id);
    //     const num = parseInt(request.params.num);

    //     const arrayRange = testArr.slice(id, num);
    //     response.status(200).json(arrayRange)
    // }; 

    private deleteDeviceData = async (request: Request, response: Response) => {
               const { id } = request.params;
        try {
            const result = await this.dataService.deleteData(id);
            response.status(200).json({ message: 'Dane urządzenia usunięte.', result });
        } catch (error: any) {
            response.status(500).json({ error: error.message });
        }
    }

    private deleteElementById = async (request: Request, response: Response) => {
        const { id } = request.params
        const index = Number(id)-1
        if(isNaN(index) || index < 0 || index >= testArr.length)
        {
            response.status(400).send("Error");
            return;
        }
        else
        {
            const temp = testArr.splice(index, 1);
            testArr.splice(index, 1);
            response.status(200).send("Deleted element: " + temp);
            return;
        }
    }

        private deleteAllDevicesData = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const deviceCount = 17;
            const results = await Promise.all(
                Array.from({ length: deviceCount }, (_, i) => this.dataService.deleteData(i.toString()))
            );
            response.status(200).json({ message: 'Dane wszystkich urządzeń usunięte.', results });
        } catch (error: any) {
            response.status(500).json({ error: error.message });
        }
    };

 }
 
 export default DataController;
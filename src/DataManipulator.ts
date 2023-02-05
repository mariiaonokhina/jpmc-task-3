import { ServerRespond } from './DataStreamer';

export interface Row {
  price_abc: number,
  price_def: number,
  ratio: number,
  timestamp: Date,
  upper_bound: number,
  lower_bound: number,
  trigger_alert: number | undefined,
}

let avgRatios: Array<number> = [];

function calculateAvgRatio() {
  let runningTotal = 0;
  let numOfItems = avgRatios.length;

  for(let i = 0; i < numOfItems; i++) {
    runningTotal += avgRatios[i];
  }

  return runningTotal / numOfItems;
}

export class DataManipulator {
  static generateRow(serverRespond: ServerRespond[]): Row {
    const priceABC = (serverRespond[0].top_ask.price + serverRespond[0].top_bid.price) / 2;
    const priceDEF = (serverRespond[1].top_ask.price + serverRespond[1].top_bid.price) / 2;

    const ratio = priceABC / priceDEF;
    avgRatios.push(ratio);

    const upperBound = calculateAvgRatio() + 0.05;
    const lowerBound = calculateAvgRatio() - 0.05;

    return {
      price_abc: priceABC,
      price_def: priceDEF,
      ratio: ratio,
      timestamp: serverRespond[0].timestamp > serverRespond[1].timestamp ? serverRespond[0].timestamp : serverRespond[1].timestamp,
      upper_bound: upperBound,
      lower_bound: lowerBound,
      trigger_alert: (ratio > upperBound) || (ratio < lowerBound) ? ratio: undefined,
    };
  }
}

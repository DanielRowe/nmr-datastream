import { cowList } from './deciferDatastream/cowInformation';
import statementInformation from './deciferDatastream/statementInformation';
import { lactationsList as lactationInformation } from './deciferDatastream/lactationInformation';
export const cowListComplete = (datastream) => {
    const completeCows = [];
    const cows = cowList(datastream);
    const statements = statementInformation(datastream);
    const lactations = lactationInformation(datastream);
    cows.map((cow) => {
        // Find relevant statement information
        const statement = statements.find((x) => x.DSIdentifier === cow.DSIdentifier);
        // Find relevant lactation information
        const lactation = lactations.filter((x) => x.DSIdentifier === cow.DSIdentifier);
        // Put together a new object!
        return completeCows.push({
            ...cow,
            currentLactationNumber: statement?.lactationNumber,
            milkSamples: statement?.milkSamples,
            services: statement?.services,
            calvings: statement?.calvings,
            events: statement?.otherEvents,
            currentLactation: statement?.currentLactation,
            allLactations: lactation,
        });
    });
    return completeCows;
};
export default cowListComplete;

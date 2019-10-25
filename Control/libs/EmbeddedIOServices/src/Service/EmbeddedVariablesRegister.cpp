#include "Service/EmbeddedVariablesRegister.h"
#include "Variables/IVariable.h"
#include "Variables/Variable_DigitalPinRecord.h"
#include "Variables/Variable_StaticScalar.h"

#ifdef EMBEDDEDVARIABLESREGISTER_H
using namespace Variables;

namespace Service
{
	void EmbeddedVariablesRegister::Register()
    {
        /*7001  */IVariable::RegisterServiceFactory();

        /*1     *///Operation_Polynomial::RegisterFactory();
        /*2     *///Operation_LookupTable::RegisterFactory();
        /*3     *///Operation_2AxisTable::RegisterFactory();
        /*4     *///Operation_DigitalPinRead::RegisterFactory();
        /*5     *///Operation_AnalogPinRead::RegisterFactory();
        /*6     *///Operation_FrequencyPinRead::RegisterFactory();
        /*7     *///Operation_PulseWidthPinRead::RegisterFactory();
        /*8     *///Operation_DutyCyclePinRead::RegisterFactory();
        /*9     *///Operation_FaultDetection::RegisterFactory();
        /*10    *///Operation_DigitalPinWrite::RegisterFactory();
        /*11    *///Operation_PwmPinWrite::RegisterFactory();
        /*12    */Variable_DigitalPinRecord::RegisterFactory();
        /*13    */Variable_StaticScalar::RegisterFactory();
        /*14    *///Operation_Math::RegisterFactory();
        /*15    *///Operation_ScheduleCallBack::RegisterFactory();
        /*16    *///Operation_GetTick::RegisterFactory();
        /*17    *///Operation_SecondsToTicks::RegisterFactory();
    }
}
#endif

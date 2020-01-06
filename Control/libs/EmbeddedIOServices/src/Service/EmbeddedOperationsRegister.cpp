#include "Service/EmbeddedOperationsRegister.h"
#include "Operations/IOperation.h"
#include "Operations/Operation_2AxisTable.h"
#include "Operations/Operation_AnalogPinRead.h"
#include "Operations/Operation_DigitalPinRead.h"
#include "Operations/Operation_DigitalPinWrite.h"
#include "Operations/Operation_DutyCyclePinRead.h"
#include "Operations/Operation_FaultDetection.h"
#include "Operations/Operation_FrequencyPinRead.h"
#include "Operations/Operation_LookupTable.h"
#include "Operations/Operation_Polynomial.h"
#include "Operations/Operation_PulseWidthPinRead.h"
#include "Operations/Operation_PwmPinWrite.h"
#include "Operations/Operation_Math.h"
#include "Operations/Operation_ScheduleCallBack.h"
#include "Operations/Operation_GetTick.h"
#include "Operations/Operation_SecondsToTicks.h"
#include "Operations/Operation_TicksToSeconds.h"

#ifdef EMBEDDEDOPERATIONSREGISTER_H
using namespace Operations;

namespace Service
{
	void EmbeddedOperationsRegister::Register()
    {
        /*6001  */IOperationBase::RegisterServiceFactory();

        /*1     */Operation_Polynomial::RegisterFactory();
        /*2     */Operation_LookupTable::RegisterFactory();
        /*3     */Operation_2AxisTable::RegisterFactory();
        /*4     */Operation_DigitalPinRead::RegisterFactory();
        /*5     */Operation_AnalogPinRead::RegisterFactory();
        /*6     */Operation_FrequencyPinRead::RegisterFactory();
        /*7     */Operation_PulseWidthPinRead::RegisterFactory();
        /*8     */Operation_DutyCyclePinRead::RegisterFactory();
        /*9     */Operation_FaultDetection::RegisterFactory();
        /*10    */Operation_DigitalPinWrite::RegisterFactory();
        /*11    */Operation_PwmPinWrite::RegisterFactory();
        /*12    *///Variable_DigitalPinRecord::RegisterFactory();
        /*13    *///Variable_StaticScalar::RegisterFactory();
        /*14    */Operation_Math::RegisterFactory();
        /*15    */Operation_ScheduleCallBack::RegisterFactory();
        /*16    */Operation_GetTick::RegisterFactory();
        /*17    */Operation_SecondsToTicks::RegisterFactory();
        /*18    */Operation_TicksToSeconds::RegisterFactory();
    }
}
#endif

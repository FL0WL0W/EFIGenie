#include "Service/HardwareAbstractionServiceBuilder.h"
#include "Service/EmbeddedOperationsRegister.h"
#include "Service/EmbeddedVariablesRegister.h"
#include "Variables/IVariable.h"
#include "Operations/IOperation.h"
#include "stdint.h"
#include "Packed.h"
#include "Interpolation.h"
#include <tuple>

/*
To use this variable
uint16									7001(BUILDER_VARIABLE)
uint16									5(FactoryID)
uint16									xx(InstanceID of Variable)
uint8 									length
uint16 									pin
bool 									inverted
*/

#ifndef VARIABLE_DIGITALPINRECORD_H
#define VARIABLE_DIGITALPINRECORD_H
namespace Variables
{
	PACK(struct Frame
	{
		public:
		uint32_t Tick;
		bool State;
		bool Valid;
	});
	struct Record
	{
		public:
		void Initialize(uint8_t length)
		{
			Length = length;
			Frames = (Frame *)calloc(length, sizeof(Frame));
		}
		static uint8_t Subtract(const uint8_t &val1, uint8_t val2, const uint8_t &length)
		{
			val2 %= length;
			if(val2 > val1)
				return length - (val2 - val1);
			return val1 - val2;
		}
		static uint8_t Add(const uint8_t &val1, uint16_t val2, const uint8_t &length)
		{
			val2 %= length;
			if(val1 + val2 > length)
				return (val1 + val2) - length;
			return val1 + val2;
		}

		uint8_t Length; //Don't modify this -_-
		uint8_t Last;
		Frame *Frames;
	};

	class Variable_DigitalPinRecord : public IVariable
	{
	protected:
		HardwareAbstraction::IDigitalService *_digitalService;
		HardwareAbstraction::ITimerService *_timerService;
		uint16_t _pin;
		bool _inverted;
		Record *_record;
	public:	
        Variable_DigitalPinRecord(Record *record, HardwareAbstraction::IDigitalService *digitalService, HardwareAbstraction::ITimerService *timerService, uint8_t length, uint16_t pin, bool inverted);
		void TranslateValue() override;
		void InterruptCallBack();

		static IVariable *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		ISERVICE_REGISTERFACTORY_H
	};
}
#endif
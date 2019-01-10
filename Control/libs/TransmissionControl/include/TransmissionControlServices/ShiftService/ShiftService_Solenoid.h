#include "IOServices/BooleanOutputService/IBooleanOutputService.h"
#include "TransmissionControlServices/ShiftService/IShiftService.h"
#include "Packed.h"

using namespace IOServices;

#if !defined(SHIFTSERVICE_SOLENOID_H) && defined(IBOOLEANOUTPUTSERVICE_H) && defined(ISHIFTSERVICE_H)
#define SHIFTSERVICE_SOLENOID_H
namespace TransmissionControlServices
{
	PACK(
	struct ShiftService_SolenoidConfig
	{
	private:
		ShiftService_SolenoidConfig()
		{

		}
	public:
		static ShiftService_SolenoidConfig* Cast(void *p)
		{
			ShiftService_SolenoidConfig *shiftServiceConfig = (ShiftService_SolenoidConfig *)p;

			shiftServiceConfig->SolenoidGearPositions = (unsigned int*)(shiftServiceConfig + 1);

			return shiftServiceConfig;
		}
		unsigned int Size()
		{
			return sizeof(ShiftService_SolenoidConfig)
				+ sizeof(unsigned int) * Gears;
		}

		unsigned char Gears;
		unsigned char Solenoids;
		unsigned int *SolenoidGearPositions;
	});

	class ShiftService_Solenoid : public IShiftService
	{
	protected:
		ShiftService_SolenoidConfig *_config;
		IBooleanOutputService **_solenoidOutputServices;
	public:
		ShiftService_Solenoid(
			ShiftService_SolenoidConfig *config,
			IBooleanOutputService **solenoidOutputServices);
		void SetGear(unsigned char gear);
	};
}
#endif
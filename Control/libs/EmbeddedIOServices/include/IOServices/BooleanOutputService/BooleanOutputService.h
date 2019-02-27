#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "IBooleanOutputService.h"
#include "Packed.h"

using namespace HardwareAbstraction;

#if !defined(BOOLEANOUTPUTSERVICE_H) && defined(IBOOLEANOUTPUTSERVICE_H) && defined(HARDWAREABSTRACTIONCOLLECTION_H)
#define BOOLEANOUTPUTSERVICE_H
namespace IOServices
{
	PACK(
	struct BooleanOutputServiceConfig
	{
	public:
		constexpr const uint32_t Size() const
		{
			return sizeof(BooleanOutputServiceConfig);
		}

		uint16_t Pin;
		bool NormalOn;
		bool HighZ;
	});

	class BooleanOutputService : public IBooleanOutputService
	{
	protected:
		const HardwareAbstractionCollection *_hardwareAbstractionCollection;
		const BooleanOutputServiceConfig *_config;
		
	public:
		BooleanOutputService(const HardwareAbstractionCollection *, const BooleanOutputServiceConfig *);

		void OutputSet() override;
		void OutputReset() override;
		void OutputWrite(bool value) override;
	};
}
#endif

#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "IBooleanInputService.h"
#include "Packed.h"

#if !defined(BOOLEANINPUTSERVICE_H) && defined(IBOOLEANINPUTSERVICE_H) && defined(HARDWAREABSTRACTIONCOLLECTION_H)
#define BOOLEANINPUTSERVICE_H
namespace IOServices
{
	PACK(
	struct BooleanInputServiceConfig
	{
	public:
		constexpr const unsigned int Size() const
		{
			return sizeof(BooleanInputServiceConfig);
		}

		unsigned short Pin;
		bool Inverted;
	});

	class BooleanInputService : public IBooleanInputService
	{
	protected:
		const HardwareAbstraction::HardwareAbstractionCollection *_hardwareAbstractionCollection;
		const BooleanInputServiceConfig *_config;
		
	public:
		BooleanInputService(const HardwareAbstraction::HardwareAbstractionCollection *, const BooleanInputServiceConfig *);
		void ReadValue() override;
	};
}
#endif

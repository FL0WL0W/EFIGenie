namespace EngineManagement
{
	class MockVoltageService : public IVoltageService
	{
	public:
		MOCK_METHOD0(ReadVoltage, void());
	};
}
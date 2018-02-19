namespace EngineManagement
{
	class MockTpsService : public ITpsService
	{
	public:
		MOCK_METHOD0(ReadTps, void());
	};
}